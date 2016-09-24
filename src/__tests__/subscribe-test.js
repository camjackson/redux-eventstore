const redux = require('redux');
const subscribe = require('../subscribe');

const rootReducer = (state, action) => {
  console.log('action dispatched:', action);
  return state;
};

const store = redux.createStore(rootReducer);

subscribe('http://0.0.0.0:2113', 'newstream', store.dispatch);
// expect('all events on the event store').to('get dispatched as actions');
