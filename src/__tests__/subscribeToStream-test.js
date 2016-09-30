'use strict';

const redux = require('redux');
const nock = require('nock');
const subscribeToStream = require('../subscribeToStream');

test('it throws an error when host is not valid', () => {
  expect(() => subscribeToStream(null, 'test-stream', () => {})).toThrowError(/host/);
  expect(() => subscribeToStream({}, 'test-stream', () => {})).toThrowError(/host/);
  expect(() => subscribeToStream('', 'test-stream', () => {})).toThrowError(/host/);
});

test('it throws an error when stream name is invalid', () => {
  expect(() => subscribeToStream('localhost', {}, () => {})).toThrowError(/stream/);
  expect(() => subscribeToStream('localhost', null, () => {})).toThrowError(/stream/);
  expect(() => subscribeToStream('localhost', '', () => {})).toThrowError(/stream/);
});

test('it throws an error when dispatch is invalid', () => {
  expect(() => subscribeToStream('localhost', 'test-stream', {})).toThrowError(/stream/);
  expect(() => subscribeToStream('localhost', 'test-stream', null)).toThrowError(/stream/);
  expect(() => subscribeToStream('localhost', 'test-stream', 'function')).toThrowError(/stream/);
});

test('it throws an error when pollPeriod is invalid', () => {
  expect(() => subscribeToStream('localhost', 'test-stream', () => {}, null)).toThrowError(/pollPeriod/);
  expect(() => subscribeToStream('localhost', 'test-stream', () => {}, {})).toThrowError(/pollPeriod/);
  expect(() => subscribeToStream('localhost', 'test-stream', () => {}, 'one')).toThrowError(/pollPeriod/);
});

test('it reads the events off the stream and dispatches them, in order', () => {
  const rootReducer = (state = 0, event) => {
    switch(event.type) {
      case 'ADD':
        return state + event.amount;
      case 'MULTIPLY':
        return state * event.amount;
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

  subscribeToStream('http://0.0.0.0:2113', 'test-stream', store.dispatch);

  // Ugly race condition test :/
  return new Promise(resolve => {
    setTimeout(() => {
      expect(store.getState()).toBe(15);
      resolve();
    }, 100);
  });
});
