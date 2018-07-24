# Ultra List
Multi purposes list: immutable, filterable, sortable

## Samples:

```js

// init list with specified items
const todos = ultraList(
  { name: 'task 2', done: true },
  { name: 'task 1', done: false },
  { name: 'task 3', done: true }
);

todos.subscribe(items => console.log('changed', items));

// define some sub lists
todos.define('orderByName', { order: { by: x => x.name } });
// order by multiple fields
todos.define('orderByNameThenDone', {
  order: [{ by: x => x.name, desc: false }, { by: x => x.done, desc: false }]
});
todos.define('active', { filter: x => !x.done });
todos.define('completed', { filter: x => x.done });

console.log('default', todos.get());

console.log('orderByName', todos.get('orderByName'));

console.log('active', todos.get('active'));

console.log('completed', todos.get('completed'));

console.log('length', todos.length);

// update item 0
todos.item(0, { name: 'task 0', done: false });

console.log('item 0', todos.item(0));

// remove completed
todos.remove(x => x.done);
console.log('completed', todos.get('completed'));

// add task 5
todos.push({ name: 'task 5', done: true });
console.log('orderByName', todos.get('orderByName'));

// create immutable list
const immutableTodos = todos.immuatable();

// support almost array methods: push / pop / slice / splice / find / findIndex / reduce / map
```
