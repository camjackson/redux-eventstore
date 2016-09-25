const redux = require('redux');
const nock = require('nock');
const subscribeToEventStore = require('../subscribe');

test('reads the events off the stream and dispatches them, in order', () => {
  const rootReducer = (state = 0, action) => {
    switch(action.type) {
      case 'ADD':
        return state + action.amount;
      case 'MULTIPLY':
        return state * action.amount;
      default:
        return state;
    }
  };

  const store = redux.createStore(rootReducer);

  nock('http://0.0.0.0:2113', { reqheaders: { Accept: 'application/vnd.eventstore.atom+json' }})
    .persist()
    .get('/streams/test-stream/0')
      .reply(200, { content: { eventType: 'ADD', data: { amount: 3 } } })
    .get('/streams/test-stream/1')
      .reply(200, { content: { eventType: 'MULTIPLY', data: { amount: 5 } } })
    .get('/streams/test-stream/2')
      .reply(404);

  subscribeToEventStore('http://0.0.0.0:2113', 'test-stream', store.dispatch);

  // Ugly race condition test :/
  return new Promise(resolve => {
    setTimeout(() => {
      expect(store.getState()).toBe(15);
      resolve();
    }, 100);
  });
});
