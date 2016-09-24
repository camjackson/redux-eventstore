const redux = require('redux');
const middleware = require('../middleware');

const rootReducer = (state, action) => {
  console.log('action', action);
  return state;
};

const eventStoreMiddleware = middleware('http://0.0.0.0:2113', 'newstream');
const store = redux.createStore(
  rootReducer,
  redux.applyMiddleware(eventStoreMiddleware)
);

store.dispatch({ type: 'SOME_ACTION', payload: 'the payload'});
// expect('the above action').to('get POSTed to the event store');
