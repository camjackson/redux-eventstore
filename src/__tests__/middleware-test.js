const redux = require('redux');
const middleware = require('../middleware');

const eventStoreMiddleware = middleware('http://0.0.0.0:2113', 'newstream');
const store = redux.createStore(
  state => state,
  redux.applyMiddleware(eventStoreMiddleware)
);

[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(i => {
  store.dispatch({ type: 'SOME_ACTION', amount: i });
});
