'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = create;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var arrayMethods = 'push pop shift unshift splice indexOf find findIndex toString'.split(/\s+/);

function create() {
  for (var _len = arguments.length, items = Array(_len), _key = 0; _key < _len; _key++) {
    items[_key] = arguments[_key];
  }

  var subLists = {};
  var list = void 0;

  function clearListCache() {
    for (var listName in subLists) {
      delete subLists[listName].processedItems;
      delete subLists[listName].orderedItems;
    }
    list.length = items.length;
  }

  function modifyItems(callback) {
    if (list.__immutable) {
      var newItems = items.slice();
      callback(newItems);
      var newList = create.apply(undefined, _toConsumableArray(callback(newItems)));
      newList.__chainable = list.__chainable;
      return newList;
    }
    clearListCache();
    callback(items);
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
    length: items.length,
    chainable: function chainable() {
      var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      if (list.__chainable === value) return list;
      var newList = create.apply(undefined, _toConsumableArray(items));
      newList.__chainable = value;
      return newList;
    },
    immuatable: function immuatable() {
      var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      if (list.__immutable === value) return list;
      var newList = create.apply(undefined, _toConsumableArray(items));
      newList.__immutable = value;
      return newList;
    },
    slice: function slice() {
      var _items;

      return create.apply(undefined, _toConsumableArray((_items = items).slice.apply(_items, arguments)));
    },
    item: function item(index, value) {
      if (arguments.length === 1) return items[index];
      return modifyItems(function (items) {
        return items[index] = value;
      });
    },
    remove: function remove(predicate) {
      var count = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      var removedItems = 0;
      var newItems = items.filter(function (item) {
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

        items = newItems;
        clearListCache();
      }

      return list;
    },
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
    get: function get() {
      var listName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'default';
      var includeMeta = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var subList = subLists[listName];
      if (!subList) {
        // create default list with no filter and no order
        subLists[listName] = subList = {};
      }

      if (!subList.processedItems) {
        var indexedItems = items.map(function (item, index) {
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
//# sourceMappingURL=index.js.map