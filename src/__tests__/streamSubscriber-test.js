import { createStore } from 'redux';
import nock from 'nock';
import streamSubscriber from '../streamSubscriber';

describe('streamSubscriber', () => {
  const auth = null;
  const logger = () => {};
  const testReducer = (state = 0, event) => {
    switch (event.type) {
      case 'ADD':
        return state + event.amount;
      case 'MULTIPLY':
        return state * event.amount;
      case 'SUBTRACT':
        return state - event.metadata.amount;
      default:
        return state;
    }
  };

  it('it throws an error when dispatch is invalid', () => {
    const subscribe = streamSubscriber('localhost', 'test-stream', auth, logger);

    expect(() => subscribe({})).toThrowError(/Invalid dispatch/);
    expect(() => subscribe(null)).toThrowError(/Invalid dispatch/);
    expect(() => subscribe('function')).toThrowError(/Invalid dispatch/);
  });

  it('it throws an error when pollPeriod is invalid', () => {
    const subscribe = streamSubscriber('localhost', 'test-stream', auth, logger);

    expect(() => subscribe(() => {}, null)).toThrowError(/Invalid pollPeriod/);
    expect(() => subscribe(() => {}, {})).toThrowError(/Invalid pollPeriod/);
    expect(() => subscribe(() => {}, 'one')).toThrowError(/Invalid pollPeriod/);
  });

  it('it throws an error when includeMetadata is invalid', () => {
    const subscribe = streamSubscriber('localhost', 'test-stream', auth, logger);

    expect(() => subscribe(() => {}, 1000, null)).toThrowError(/Invalid includeMetadata/);
    expect(() => subscribe(() => {}, 1000, {})).toThrowError(/Invalid includeMetadata/);
    expect(() => subscribe(() => {}, 1000, 'yes')).toThrowError(/Invalid includeMetadata/);
  });

  it('it reads the events off the stream and dispatches them, in order', () => {
    const store = createStore(testReducer);

    nock('http://0.0.0.0:2113', { reqheaders: { Accept: 'application/vnd.eventstore.atom+json' } })
      .persist()
      .get('/streams/test-stream/0')
        .reply(200, { content: { eventType: 'ADD', data: { amount: 3 } } })
      .get('/streams/test-stream/1')
        .reply(200, { content: { eventType: 'MULTIPLY', data: { amount: 5 } } })
      .get('/streams/test-stream/2')
        .reply(404)
      .get('/streams/test-stream/3')
        .reply(200, { content: { eventType: 'SUBTRACT', data: { }, metadata: { amount: 10 } } });

    const subscribe = streamSubscriber('http://0.0.0.0:2113', 'test-stream', auth, logger);
    subscribe(store.dispatch, 50);

    return new Promise(resolve => {
      setInterval(() => {
        expect(store.getState()).toBe(15);
        resolve();
      }, 10);
    });
  });

  it('it reads the events off the stream and includes metadata', () => {
    const store = createStore(testReducer);

    nock('http://0.0.0.0:2113', { reqheaders: { Accept: 'application/vnd.eventstore.atom+json' } })
      .persist()
      .get('/streams/metadata-stream/0')
        .reply(200, { content: { eventType: 'ADD', data: { amount: 3 } } })
      .get('/streams/metadata-stream/1')
        .reply(200, { content: { eventType: 'MULTIPLY', data: { amount: 5 } } })
      .get('/streams/metadata-stream/2')
        .reply(200, { content: { eventType: 'SUBTRACT', data: { amount: 0 }, metadata: { amount: 10 } } });

    const subscribe = streamSubscriber('http://0.0.0.0:2113', 'metadata-stream', auth, logger);
    subscribe(store.dispatch, 50, true);

    return new Promise(resolve => {
      setInterval(() => {
        expect(store.getState()).toBe(5);
        resolve();
      }, 10);
    });
  });

  it('it can send basic auth when retrieving the stream', () => {
    const server = nock('http://0.0.0.0:2113', { reqheaders: { Authorization: 'Basic Y2FtOnMzY3IzdA==' } })
      .persist()
      .get('/streams/auth-stream/0')
        .reply(200, { content: { eventType: 'ADD', data: { amount: 3 } } });

    const subscribe = streamSubscriber('http://0.0.0.0:2113', 'auth-stream', 'Basic Y2FtOnMzY3IzdA==', logger);
    subscribe(() => {}, 50);

    return new Promise(resolve => {
      setInterval(() => {
        expect(server.isDone()).toBe(true);
        resolve();
      }, 100);
    });
  });

  it('it skips events that have no content or eventType', () => {
    const store = createStore(testReducer);

    nock('http://0.0.0.0:2113', { reqheaders: { Accept: 'application/vnd.eventstore.atom+json' } })
      .persist()
      .get('/streams/validation-stream/0')
        .reply(200, { })
      .get('/streams/validation-stream/1')
        .reply(200, { content: { data: { amount: 5 } } })
      .get('/streams/validation-stream/2')
        .reply(200, { content: { eventType: 'ADD', data: { amount: 2 } } })
      .get('/streams/validation-stream/3')
        .reply(404);

    const subscribe = streamSubscriber('http://0.0.0.0:2113', 'validation-stream', auth, logger);
    subscribe(store.dispatch, 50);

    return new Promise(resolve => {
      setInterval(() => {
        expect(store.getState()).toBe(2);
        resolve();
      }, 10);
    });
  });

  it('it continues on when the dispatch throws an error', () => {
    const dispatch = () => {
      throw new Error(':(');
    };

    const server = nock('http://0.0.0.0:2113', { reqheaders: { Accept: 'application/vnd.eventstore.atom+json' } })
      .persist()
      .get('/streams/error-stream/0')
        .reply(200, { content: { eventType: 'ADD' } })
      .get('/streams/error-stream/1')
        .reply(404);

    const subscribe = streamSubscriber('http://0.0.0.0:2113', 'error-stream', auth, logger);
    subscribe(dispatch, 50);

    return new Promise(resolve => {
      setInterval(() => {
        expect(server.isDone()).toBe(true);
        resolve();
      }, 10);
    });
  });

  it('it continues on when the dispatch returns a rejected promise', () => {
    const dispatch = () => Promise.reject();

    const server = nock('http://0.0.0.0:2113', { reqheaders: { Accept: 'application/vnd.eventstore.atom+json' } })
      .persist()
      .get('/streams/reject-stream/0')
        .reply(200, { content: { eventType: 'ADD' } })
      .get('/streams/reject-stream/1')
        .reply(404);

    const subscribe = streamSubscriber('http://0.0.0.0:2113', 'reject-stream', auth, logger);
    subscribe(dispatch, 50);

    return new Promise(resolve => {
      setInterval(() => {
        expect(server.isDone()).toBe(true);
        resolve();
      }, 10);
    });
  });
});
