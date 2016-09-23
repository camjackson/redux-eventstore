const redux = require('redux');
const middleware = require('../middleware');

const rootReducer = (state, action) => {
  console.log('action', action);
  return state;
};

//'http://0.0.0.0:2113/streams/newstream'
const eventStoreMiddleware = middleware('http://0.0.0.0:2113', 'newstream');
const store = redux.createStore(
  rootReducer,
  redux.applyMiddleware(eventStoreMiddleware)
);

store.dispatch({ type: 'SOME_ACTION', payload: 'the payload'});
