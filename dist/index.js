'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var arrayMethods = 'push pop shift unshift splice slice indexOf find findIndex toString map'.split(/\s+/);

function create() {
  for (var _len = arguments.length, _items2 = Array(_len), _key = 0; _key < _len; _key++) {
    _items2[_key] = arguments[_key];
  }

  var subLists = {};
  var list = void 0;
  var subscribers = [];

  function clearListCache() {
    Object.keys(subLists).forEach(function (listName) {
      delete subLists[listName].processedItems;
      delete subLists[listName].orderedItems;
    });
    list.length = _items2.length;
  }

  function modifyItems(callback) {
    if (list.__immutable) {
      var newItems = _items2.slice();
      callback(newItems);
      var newList = create.apply(undefined, _toConsumableArray(callback(newItems)));
      newList.__chainable = list.__chainable;
      return newList;
    }
    clearListCache();
    callback(_items2);
    subscribers.forEach(function (subscriber) {
      return subscriber(_items2);
    });
    return list;
  }

  return list = Object.assign(arrayMethods.reduce(function (prototype, method) {
    prototype[method] = function () {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      var result = void 0;
      var listResult = modifyItems(function (items) {
        return result = items[method].apply(items, args);
      });
      if (list.__chainable || method === 'push' || method === 'unshift') return listResult;
      return result;
    };
    return prototype;
  }, {}), {
    length: _items2.length,
    /**
     * subscribe changed event
     */
    subscribe: function subscribe(subscriber) {
      subscribers.push(subscriber);
      return list.__chainable ? list : function () {
        return subscribers = subscribers.filter(function (x) {
          return x !== subscriber;
        });
      };
    },

    /**
     * make the list is chainable
     */
    chainable: function chainable() {
      var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      if (list.__chainable === value) return list;
      var newList = create.apply(undefined, _toConsumableArray(_items2));
      newList.__chainable = value;
      newList.__immutable = list.__immutable;
      return newList;
    },

    /**
     * make the list is immutable
     */
    immuatable: function immuatable() {
      var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      if (list.__immutable === value) return list;
      var newList = create.apply(undefined, _toConsumableArray(_items2));
      newList.__immutable = value;
      newList.__chainable = list.__chainable;
      return newList;
    },

    /**
     * clone list
     */
    clone: function clone() {
      var _items;

      return create.apply(undefined, _toConsumableArray((_items = _items2).slice.apply(_items, arguments)));
    },

    /**
     * get original items
     */
    items: function items() {
      return _items2;
    },

    /**
     * get/set item by its index
     */
    item: function item(index, value) {
      if (arguments.length === 1) return _items2[index];
      return modifyItems(function (items) {
        return items[index] = value;
      });
    },

    /**
     * remove items which is satisfied predicate
     */
    remove: function remove(predicate) {
      var count = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      var removedItems = 0;
      var newItems = _items2.filter(function (item) {
        if (count && removedItems >= count) return true;
        if (predicate(item)) {
          removedItems++;
          return false;
        }
        return true;
      });
      if (removedItems) {
        if (list.__immutable) {
          return create.apply(undefined, _toConsumableArray(newItems));
        }

        _items2 = newItems;
        clearListCache();
      }

      return list;
    },

    /**
     * define sub list with specified options: { filter, order }
     */
    define: function define(listName) {
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          filter = _ref.filter,
          order = _ref.order;

      if (order && !(order instanceof Array)) {
        order = [order];
      }
      subLists[listName] = { filter: filter, order: order };
      return list;
    },

    /**
     * get sub list
     * @listName string name defined sub list
     * @includeMeta boolean returns array that contains item and its metadata { order: number, item: object, index: number } if true unless returns filtered and sorted items
     */
    get: function get() {
      var listName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'default';
      var includeMeta = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var subList = subLists[listName];
      if (!subList) {
        // create default list with no filter and no order
        subLists[listName] = subList = {};
      }

      if (!subList.processedItems) {
        var indexedItems = _items2.map(function (item, index) {
          return { index: index, item: item };
        });
        var filteredItems = subList.filter ? indexedItems.filter(function (x) {
          return subList.filter(x.item);
        }) : indexedItems;
        var orderedItems = subList.order ? filteredItems.slice().sort(function (a, b) {
          for (var index = 0; index < subList.order.length; index++) {
            var order = subList.order[index];
            var getter = order.by;
            var aValue = getter(a.item);
            var bValue = getter(b.item);
            if (aValue > bValue) return order.desc ? -1 : 1;
            if (aValue < bValue) return order.desc ? 1 : -1;
          }
          return 0;
        }) : filteredItems;

        orderedItems.forEach(function (x, index) {
          return x.order = index;
        });

        subList.processedItems = filteredItems;
        subList.orderedItems = orderedItems.map(function (x) {
          return x.item;
        });

        if (subList.extra) {
          subList.extraData = subList.extra(subList.processedItems, subList.orderedItems) || {};
        }
      }

      if (typeof includeMeta === 'string') return subList.extraData[includeMeta];

      return includeMeta ? subList.processedItems : subList.orderedItems;
    }
  });
}
exports.default = create;
//# sourceMappingURL=index.js.map