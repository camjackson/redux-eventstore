const redux = require('redux');
const subscribeToEventStore = require('../subscribe');

const rootReducer = (state = 0, action) => {
  const newState = state + (action.amount || 0);
  console.log(`oldState: ${state}, action: ${JSON.stringify(action)}, newState: ${newState}`);
  return newState;
};

const store = redux.createStore(rootReducer);

subscribeToEventStore('http://0.0.0.0:2113', 'newstream', store.dispatch);
