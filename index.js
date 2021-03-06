const arrayMethods = 'push pop shift unshift splice slice indexOf find findIndex toString map'.split(
  /\s+/
);
const cloneMethod = Symbol('clone');

export default function create(...items) {
  let subLists = {};
  let list;
  let subscribers = [];
  const filters = {};
  const orders = {};
  const mappers = {};

  function clearListCache() {
    Object.keys(subLists).forEach(listName => {
      delete subLists[listName].processedItems;
      delete subLists[listName].orderedItems;
    });
    list.length = items.length;
  }

  function dispatch() {
    subscribers.forEach(subscriber => subscriber(items));
  }

  function modifyItems(callback) {
    if (list.__immutable) {
      const newItems = items.slice();
      callback(newItems);
      return createCopy(newItems);
    }
    clearListCache();
    callback(items);
    list.length = items.length;
    dispatch();
    return list;
  }

  function doFilter(filter, items) {
    if (typeof filter === 'string') {
      filter = filters[filter];

      if (!filter) {
        throw new Error(`Filter named ${filter} cannot be found`);
      }
    }

    return items.filter(x => filter(x.item));
  }

  function doSort(order, items) {
    if (typeof order === 'string') {
      order = orders[order];

      if (!order) {
        throw new Error(`Order named ${order} cannot be found`);
      }
    }

    return items.slice().sort((a, b) => {
      for (let index = 0; index < order.length; index++) {
        const o = order[index];
        const getter = o.by;
        const aValue = getter(a.item);
        const bValue = getter(b.item);
        if (aValue > bValue) return o.desc ? -1 : 1;
        if (aValue < bValue) return o.desc ? 1 : -1;
      }
      return 0;
    });
  }

  function createCopy(newItems, meta = {}) {
    return create(...newItems)[cloneMethod](
      Object.assign(
        {
          subscribers,
          filters,
          mappers,
          orders,
          subLists,
          __chainable: list.__chainable,
          __immutable: list.__immutable
        },
        meta
      )
    );
  }

  return (list = Object.assign(
    arrayMethods.reduce((prototype, method) => {
      prototype[method] = function(...args) {
        let result;
        const listResult = modifyItems(
          items => (result = items[method](...args))
        );
        if (list.__chainable || method === 'push' || method === 'unshift')
          return listResult;
        return result;
      };
      return prototype;
    }, {}),
    {
      length: items.length,
      [cloneMethod](meta) {
        subscribers.push(...meta.subscribers);
        Object.assign(filters, meta.filters);
        Object.assign(orders, meta.orders);
        Object.assign(mappers, meta.mappers);
        Object.keys(meta.subLists).forEach(subListName => {
          subLists[subListName] = Object.assign(
            {
              processedItems: undefined,
              orderedItems: undefined
            },
            meta.subLists[subListName]
          );
        });
        list.__chainable = meta.__chainable;
        list.__immutable = meta.__immutable;
        return list;
      },
      /**
       * update all items which is satisfied predicate
       */
      update(predicate, updater, count = 0) {
        let updatedItems = 0;
        const newItems = items.map((item, index) => {
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

          items = newItems;
          clearListCache();
          dispatch();
        }

        return list;
      },
      /**
       * subscribe changed event
       */
      subscribe(subscriber) {
        subscribers.push(subscriber);
        return list.__chainable
          ? list
          : () => (subscribers = subscribers.filter(x => x !== subscriber));
      },
      /**
       * make the list is chainable
       */
      chainable(value = true) {
        if (list.__chainable === value) return list;
        return createCopy(items, {
          __chainable: value
        });
      },
      /**
       * make the list is immutable
       */
      immuatable(value = true) {
        if (list.__immutable === value) return list;
        return createCopy(items, { __immutable: value });
      },
      /**
       * clone list
       */
      clone(includeSubscribers) {
        if (includeSubscribers) {
          return createCopy(items);
        }
        return createCopy(items, {
          subscribers: []
        });
      },
      /**
       * get original items
       */
      items() {
        return items;
      },
      /**
       * get/set item by its index
       */
      item(index, value) {
        if (arguments.length === 1) return items[index];
        return modifyItems(items => (items[index] = value));
      },
      removeAll() {
        items.splice(0, items.length);
        dispatch();
        return list;
      },
      /**
       * remove items which is satisfied predicate
       */
      remove(predicate, count = 0) {
        let removedItems = 0;
        const newItems = items.filter(item => {
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

          items = newItems;
          clearListCache();
          dispatch();
        }

        return list;
      },
      /**
       * define sub list with specified options: { filter, order }
       */
      define(listName, options = {}) {
        const [type, name] = listName.split(':');
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
              throw new Error(`Unsupported option ${type}`);
          }
        } else {
          let { filter, order, map } = options;
          if (order && !(order instanceof Array) && typeof order !== 'string') {
            order = [order];
          }
          subLists[listName] = { filter, order, map };
        }

        return list;
      },
      /**
       * get sub list
       * @listName string name defined sub list
       * @includeMeta boolean returns array that contains item and its metadata { order: number, item: object, index: number } if true unless returns filtered and sorted items
       */
      get(listName = 'default', includeMeta = false) {
        let subList = subLists[listName];
        if (!subList) {
          // create default list with no filter and no order
          subLists[listName] = subList = {};
          // list name can be combination of predefined filter/order names
          if (listName.indexOf(':') !== -1) {
            // parse feature list which is separated by spacings
            listName.split(/\s+/).forEach(feature => {
              // featureType:featureName
              const [type, name] = feature.split(/:/);
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
          const indexedItems = items.map((item, index) => ({ index, item }));
          const filteredItems = subList.filter
            ? doFilter(subList.filter, indexedItems)
            : indexedItems;
          const orderedItems = subList.order
            ? doSort(subList.order, filteredItems)
            : filteredItems;

          orderedItems.forEach((x, index) => (x.order = index));

          const mapper = subList.map
            ? subList.map instanceof Function
              ? subList.map
              : mappers[subList.map]
            : undefined;
          subList.processedItems = mapper
            ? filteredItems.map(mapper)
            : filteredItems;
          subList.orderedItems = orderedItems.map(
            (x, ...args) => (mapper ? mapper(x.item, ...args) : x.item)
          );

          if (subList.extra) {
            subList.extraData =
              subList.extra(subList.processedItems, subList.orderedItems) || {};
          }
        }

        if (typeof includeMeta === 'string')
          return subList.extraData[includeMeta];

        return includeMeta ? subList.processedItems : subList.orderedItems;
      }
    }
  ));
}
