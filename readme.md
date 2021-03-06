# Ultra List
Multi purposes list: immutable, filterable, sortable

## Samples:

### Todo App: https://codesandbox.io/s/421yyv68w0

```js
import React from 'react';
import ReactDOM from 'react-dom';
import ultraList from 'ultralist';

let uniqueId = 0;
const rootElement = document.getElementById('root');
const todos = ultraList(
  { name: 'Task 1', done: true, id: uniqueId++ },
  { name: 'Task 2', done: false, id: uniqueId++ }
);

// re-render app if there is any change
todos.subscribe(render);
// define orders
todos.define('order:byNameAsc', { by: x => x.name, desc: false });
todos.define('order:byNameDesc', { by: x => x.name, desc: true });
todos.define('order:byIdAsc', { by: x => x.id, desc: false });
todos.define('order:byIdDesc', { by: x => x.id, desc: true });
// define filters
todos.define('filter:all', x => true);
todos.define('filter:active', x => !x.done);
todos.define('filter:completed', x => x.done);
// define sub lists
todos.define('all', { filter: 'all' });
todos.define('active', { filter: 'active' });
todos.define('completed', { filter: 'completed' });
todos.define('activeTodoNames', { filter: 'active', map: x => x.name });

class App extends React.Component {
  constructor() {
    super();

    this.state = {
      name: '',
      edittingItem: undefined
    };
  }

  render() {
    const {
      name,
      filter = 'all',
      order = 'byNameAsc',
      edittingItem
    } = this.state;
    const mainListName = `filter:${filter} order:${order}`;
    const handleChange = e => this.setState({ name: e.target.value });
    const handleSubmit = e => {
      if (name) {
        if (edittingItem) {
          todos.update(
            x => x === edittingItem,
            item => ({
              ...item,
              name
            }),
            1
          );
          this.setState({ name: '', edittingItem: undefined });
        } else {
          todos.push({ name, done: false, id: uniqueId++ });
          this.setState({ name: '' });
        }
      }

      e.preventDefault();
    };
    const handleFilter = filter => this.setState({ filter });
    const handleSort = newOrder => {
      if (newOrder === 'byName') {
        newOrder = order === 'byNameAsc' ? 'byNameDesc' : 'byNameAsc';
      } else if (newOrder === 'byId') {
        newOrder = order === 'byIdAsc' ? 'byIdDesc' : 'byIdAsc';
      } else {
        throw new Error('Invalid order');
      }
      this.setState({ order: newOrder });
    };
    const handleCancel = e =>
      this.setState({ edittingItem: undefined, name: '' });
    const editItem = item =>
      this.setState({
        edittingItem: item,
        name: item.name
      });
    const toggleItem = item => {
      todos.update(
        x => x === item,
        item => ({
          ...item,
          done: !item.done
        }),
        1 // update one
      );
    };
    const removeItem = item => {
      todos.remove(x => x === item, 1);
    };
    const renderTodos = () =>
      !todos.length ? (
        <div className="text-center">Nothing to do</div>
      ) : (
        <ul className="list-group">
          {todos.get(mainListName).map(item => (
            <li
              className="list-group-item"
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <span
                onClick={e => toggleItem(item)}
                style={{
                  color: item.done ? 'silver' : 'black'
                }}
              >
                [{item.id}] {item.name}
              </span>
              <span>
                <a
                  onClick={e => editItem(item)}
                  style={{ margin: '0 5px' }}
                  href="javascript:;"
                >
                  Edit
                </a>
                <a
                  onClick={e => toggleItem(item)}
                  style={{ margin: '0 5px' }}
                  href="javascript:;"
                >
                  Toggle
                </a>
                <a
                  onClick={e => removeItem(item)}
                  style={{ margin: '0 5px' }}
                  href="javascript:;"
                >
                  Remove
                </a>
              </span>
            </li>
          ))}
        </ul>
      );

    return (
      <form onSubmit={handleSubmit} className="container">
        <h1>Todo App ({todos.length})</h1>
        <div className="form-group">
          <input
            className="form-control"
            type="text"
            value={name}
            onChange={handleChange}
            placeholder="Enter todo"
          />
        </div>
        <div className="form-group">
          You have to finish:{' '}
          <span>{todos.get('activeTodoNames').join(', ')}</span>
        </div>
        <div className="form-group">
          {edittingItem && (
            <div className="text-center">
              <a onClick={handleCancel} href="javascript:;">
                Cancel Editing
              </a>
            </div>
          )}
          {!edittingItem && renderTodos()}
        </div>
        {!edittingItem && (
          <div className="form-group">
            <span
              style={{
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <span>
                <span
                  className={`btn btn-sm btn-${
                    filter === 'all' ? 'primary' : 'default'
                  }`}
                  onClick={e => handleFilter('all')}
                >
                  All ({todos.get('all').length})
                </span>{' '}
                <span
                  className={`btn btn-sm btn-${
                    filter === 'active' ? 'primary' : 'default'
                  }`}
                  onClick={e => handleFilter('active')}
                >
                  Active ({todos.get('active').length})
                </span>{' '}
                <span
                  className={`btn btn-sm btn-${
                    filter === 'completed' ? 'primary' : 'default'
                  }`}
                  onClick={e => handleFilter('completed')}
                >
                  Completed ({todos.get('completed').length})
                </span>
              </span>
              <span>
                <span>Sort by </span>
                <span
                  className={`btn btn-sm btn-${
                    order === 'byNameAsc' || order === 'byNameDesc'
                      ? 'primary'
                      : 'default'
                  }`}
                  onClick={e => handleSort('byName')}
                >
                  Name
                </span>{' '}
                <span
                  className={`btn btn-sm btn-${
                    order === 'byIdAsc' || order === 'byIdDesc'
                      ? 'primary'
                      : 'default'
                  }`}
                  onClick={e => handleSort('byId')}
                >
                  Id
                </span>
              </span>
            </span>
          </div>
        )}
      </form>
    );
  }
}

function render() {
  ReactDOM.render(<App />, rootElement);
}

render();

// support almost array methods: push / pop / slice / splice / find / findIndex / reduce / map
```
