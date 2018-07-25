'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var arrayMethods = 'push pop shift unshift splice slice indexOf find findIndex toString map'.split(/\s+/);

function create() {
  for (var _len = arguments.length, _items2 = Array(_len), _key = 0; _key < _len; _key++) {
    _items2[_key] = arguments[_key];
  }

  var subLists = {};
  var list = void 0;
  var subscribers = [];
  var filters = {};
  var orders = {};

  function clearListCache() {
    Object.keys(subLists).forEach(function (listName) {
      delete subLists[listName].processedItems;
      delete subLists[listName].orderedItems;
    });
    list.length = _items2.length;
  }

  function dispatch() {
    subscribers.forEach(function (subscriber) {
      return subscriber(_items2);
    });
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
    list.length = _items2.length;
    dispatch();
    return list;
  }

  function doFilter(filter, items) {
    if (typeof filter === 'string') {
      filter = filters[filter];

      if (!filter) {
        throw new Error('Filter named ' + filter + ' cannot be found');
      }
    }

    return items.filter(function (x) {
      return filter(x.item);
    });
  }

  function doSort(order, items) {
    if (typeof order === 'string') {
      order = orders[order];

      if (!order) {
        throw new Error('Order named ' + order + ' cannot be found');
      }
    }

    return items.slice().sort(function (a, b) {
      for (var index = 0; index < order.length; index++) {
        var o = order[index];
        var getter = o.by;
        var aValue = getter(a.item);
        var bValue = getter(b.item);
        if (aValue > bValue) return o.desc ? -1 : 1;
        if (aValue < bValue) return o.desc ? 1 : -1;
      }
      return 0;
    });
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
     * update all items which is satisfied predicate
     */
    update: function update(predicate, updater) {
      var count = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

      var updatedItems = 0;
      var newItems = _items2.map(function (item, index) {
        if (count && updatedItems >= count) return item;
        if (predicate(item)) {
          updatedItems++;
          return updater(item, index);
        }
        return item;
      });
      if (updatedItems) {
        if (list.__immutable) {
          return create.apply(undefined, _toConsumableArray(newItems));
        }

        _items2 = newItems;
        clearListCache();
        dispatch();
      }

      return list;
    },

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
        dispatch();
      }

      return list;
    },

    /**
     * define sub list with specified options: { filter, order }
     */
    define: function define(listName) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var _listName$split = listName.split(':'),
          _listName$split2 = _slicedToArray(_listName$split, 2),
          type = _listName$split2[0],
          name = _listName$split2[1];

      if (name) {
        switch (type) {
          case 'order':
            if (options instanceof Function) {
              options = { by: options };
            }
            if (!(options instanceof Array)) {
              options = [options];
            }

            orders[name] = options;
            break;
          case 'filter':
            filters[name] = options;
            break;
          default:
            throw new Error('Unsupported option ' + type);
        }
      } else {
        var _options = options,
            filter = _options.filter,
            order = _options.order;

        if (order && !(order instanceof Array) && typeof order !== 'string') {
          order = [order];
        }
        subLists[listName] = { filter: filter, order: order };
      }

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
        // list name can be combination of predefined filter/order names
        if (listName.indexOf(':') !== -1) {
          // parse feature list which is separated by spacings
          listName.split(/\s+/).forEach(function (feature) {
            // featureType:featureName
            var _feature$split = feature.split(/:/),
                _feature$split2 = _slicedToArray(_feature$split, 2),
                type = _feature$split2[0],
                name = _feature$split2[1];

            if (!name) {
              // is sub list name, copy all props of referenced sub list to current
              Object.assign(subList, subLists[type]);
            } else {
              subList[type] = name;
            }
          });
        }
      }

      if (!subList.processedItems) {
        var indexedItems = _items2.map(function (item, index) {
          return { index: index, item: item };
        });
        var filteredItems = subList.filter ? doFilter(subList.filter, indexedItems) : indexedItems;
        var orderedItems = subList.order ? doSort(subList.order, filteredItems) : filteredItems;

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