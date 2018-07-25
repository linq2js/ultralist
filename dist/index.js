'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var arrayMethods = 'push pop shift unshift splice slice indexOf find findIndex toString map'.split(/\s+/);
var cloneMethod = Symbol('clone');

function create() {
  var _Object$assign;

  for (var _len = arguments.length, _items = Array(_len), _key = 0; _key < _len; _key++) {
    _items[_key] = arguments[_key];
  }

  var subLists = {};
  var list = void 0;
  var subscribers = [];
  var filters = {};
  var orders = {};
  var mappers = {};

  function clearListCache() {
    Object.keys(subLists).forEach(function (listName) {
      delete subLists[listName].processedItems;
      delete subLists[listName].orderedItems;
    });
    list.length = _items.length;
  }

  function dispatch() {
    subscribers.forEach(function (subscriber) {
      return subscriber(_items);
    });
  }

  function modifyItems(callback) {
    if (list.__immutable) {
      var newItems = _items.slice();
      callback(newItems);
      return createCopy(newItems);
    }
    clearListCache();
    callback(_items);
    list.length = _items.length;
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

  function createCopy(newItems) {
    var meta = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return create.apply(undefined, _toConsumableArray(newItems))[cloneMethod](Object.assign({
      subscribers: subscribers,
      filters: filters,
      mappers: mappers,
      orders: orders,
      subLists: subLists,
      __chainable: list.__chainable,
      __immutable: list.__immutable
    }, meta));
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
  }, {}), (_Object$assign = {
    length: _items.length
  }, _defineProperty(_Object$assign, cloneMethod, function (meta) {
    var _subscribers;

    (_subscribers = subscribers).push.apply(_subscribers, _toConsumableArray(meta.subscribers));
    Object.assign(filters, meta.filters);
    Object.assign(orders, meta.orders);
    Object.assign(mappers, meta.mappers);
    Object.keys(meta.subLists).forEach(function (subListName) {
      subLists[subListName] = Object.assign({
        processedItems: undefined,
        orderedItems: undefined
      }, meta.subLists[subListName]);
    });
    list.__chainable = meta.__chainable;
    list.__immutable = meta.__immutable;
    return list;
  }), _defineProperty(_Object$assign, 'update', function update(predicate, updater) {
    var count = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

    var updatedItems = 0;
    var newItems = _items.map(function (item, index) {
      if (count && updatedItems >= count) return item;
      if (predicate(item)) {
        updatedItems++;
        return updater(item, index);
      }
      return item;
    });
    if (updatedItems) {
      if (list.__immutable) {
        return createCopy(newItems);
      }

      _items = newItems;
      clearListCache();
      dispatch();
    }

    return list;
  }), _defineProperty(_Object$assign, 'subscribe', function subscribe(subscriber) {
    subscribers.push(subscriber);
    return list.__chainable ? list : function () {
      return subscribers = subscribers.filter(function (x) {
        return x !== subscriber;
      });
    };
  }), _defineProperty(_Object$assign, 'chainable', function chainable() {
    var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

    if (list.__chainable === value) return list;
    return createCopy(_items, {
      __chainable: value
    });
  }), _defineProperty(_Object$assign, 'immuatable', function immuatable() {
    var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

    if (list.__immutable === value) return list;
    return createCopy(_items, { __immutable: value });
  }), _defineProperty(_Object$assign, 'clone', function clone(includeSubscribers) {
    if (includeSubscribers) {
      return createCopy(_items);
    }
    return createCopy(_items, {
      subscribers: []
    });
  }), _defineProperty(_Object$assign, 'items', function items() {
    return _items;
  }), _defineProperty(_Object$assign, 'item', function item(index, value) {
    if (arguments.length === 1) return _items[index];
    return modifyItems(function (items) {
      return items[index] = value;
    });
  }), _defineProperty(_Object$assign, 'removeAll', function removeAll() {
    _items.splice(0, _items.length);
    dispatch();
    return list;
  }), _defineProperty(_Object$assign, 'remove', function remove(predicate) {
    var count = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    var removedItems = 0;
    var newItems = _items.filter(function (item) {
      if (count && removedItems >= count) return true;
      if (predicate(item)) {
        removedItems++;
        return false;
      }
      return true;
    });
    if (removedItems) {
      if (list.__immutable) {
        return createCopy(newItems);
      }

      _items = newItems;
      clearListCache();
      dispatch();
    }

    return list;
  }), _defineProperty(_Object$assign, 'define', function define(listName) {
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
        case 'map':
          mappers[name] = options;
          break;
        default:
          throw new Error('Unsupported option ' + type);
      }
    } else {
      var _options = options,
          filter = _options.filter,
          order = _options.order,
          map = _options.map;

      if (order && !(order instanceof Array) && typeof order !== 'string') {
        order = [order];
      }
      subLists[listName] = { filter: filter, order: order, map: map };
    }

    return list;
  }), _defineProperty(_Object$assign, 'get', function get() {
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
      var indexedItems = _items.map(function (item, index) {
        return { index: index, item: item };
      });
      var filteredItems = subList.filter ? doFilter(subList.filter, indexedItems) : indexedItems;
      var orderedItems = subList.order ? doSort(subList.order, filteredItems) : filteredItems;

      orderedItems.forEach(function (x, index) {
        return x.order = index;
      });

      var mapper = subList.map ? subList.map instanceof Function ? subList.map : mappers[subList.map] : undefined;
      subList.processedItems = mapper ? filteredItems.map(mapper) : filteredItems;
      subList.orderedItems = orderedItems.map(function (x) {
        for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
          args[_key3 - 1] = arguments[_key3];
        }

        return mapper ? mapper.apply(undefined, [x.item].concat(args)) : x.item;
      });

      if (subList.extra) {
        subList.extraData = subList.extra(subList.processedItems, subList.orderedItems) || {};
      }
    }

    if (typeof includeMeta === 'string') return subList.extraData[includeMeta];

    return includeMeta ? subList.processedItems : subList.orderedItems;
  }), _Object$assign));
}
exports.default = create;
//# sourceMappingURL=index.js.map