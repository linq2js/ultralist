const arrayMethods = 'push pop shift unshift splice indexOf find findIndex toString forEach some every reduce'.split(
  /\s+/
);

export default function create(...items) {
  let subLists = {};
  let list;

  function clearListCache() {
    for (let listName in subLists) {
      delete subLists[listName].processedItems;
      delete subLists[listName].orderedItems;
    }
    list.length = items.length;
  }

  function modifyItems(callback) {
    if (list.__immutable) {
      const newItems = items.slice();
      callback(newItems);
      const newList = create(...callback(newItems));
      newList.__chainable = list.__chainable;
      return newList;
    }
    clearListCache();
    callback(items);
    return list;
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
      chainable(value = true) {
        if (list.__chainable === value) return list;
        const newList = create(...items);
        newList.__chainable = value;
        return newList;
      },
      immuatable(value = true) {
        if (list.__immutable === value) return list;
        const newList = create(...items);
        newList.__immutable = value;
        return newList;
      },
      slice(...args) {
        return create(...items.slice(...args));
      },
      item(index, value) {
        if (arguments.length === 1) return items[index];
        return modifyItems(items => (items[index] = value));
      },
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
            return create(...newItems);
          }

          items = newItems;
          clearListCache();
        }

        return list;
      },
      define(listName, { filter, order } = {}) {
        if (order && !(order instanceof Array)) {
          order = [order];
        }
        subLists[listName] = { filter, order };
        return list;
      },
      get(listName = 'default', includeMeta = false) {
        let subList = subLists[listName];
        if (!subList) {
          // create default list with no filter and no order
          subLists[listName] = subList = {};
        }

        if (!subList.processedItems) {
          const indexedItems = items.map((item, index) => ({ index, item }));
          const filteredItems = subList.filter
            ? indexedItems.filter(x => subList.filter(x.item))
            : indexedItems;
          const orderedItems = subList.order
            ? filteredItems.slice().sort((a, b) => {
              for (let index = 0; index < subList.order.length; index++) {
                const order = subList.order[index];
                const getter = order.by;
                const aValue = getter(a.item);
                const bValue = getter(b.item);
                if (aValue > bValue) return order.desc ? -1 : 1;
                if (aValue < bValue) return order.desc ? 1 : -1;
              }
              return 0;
            })
            : filteredItems;

          orderedItems.forEach((x, index) => (x.order = index));

          subList.processedItems = filteredItems;
          subList.orderedItems = orderedItems.map(x => x.item);

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
