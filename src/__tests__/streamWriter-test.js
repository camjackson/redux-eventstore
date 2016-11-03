import nock from 'nock';
import streamWriter from '../streamWriter';

describe('streamWriter', () => {
  const auth = null;
  const logger = () => {};

  it('it throws an error when the event is invalid', () => {
    const writeToStream = streamWriter('localhost', 'test-stream', auth, logger);

    expect(() => writeToStream('')).toThrowError(/Invalid event/);
    expect(() => writeToStream(null)).toThrowError(/Invalid event/);
    expect(() => writeToStream('hello')).toThrowError(/Invalid event/);
  });

  it('it throws an error when the event type is invalid', () => {
    const writeToStream = streamWriter('localhost', 'test-stream', auth, logger);

    expect(() => writeToStream({ type: '' })).toThrowError(/Invalid event type/);
    expect(() => writeToStream({ type: null })).toThrowError(/Invalid event type/);
    expect(() => writeToStream({ type: {} })).toThrowError(/Invalid event type/);
  });

  it('it rejects when the server returns an error', () => {
    const writeToStream = streamWriter('localhost', 'error-stream', auth, logger);

    return new Promise((resolve, reject) => (
      writeToStream({ type: 'SOME_EVENT' })
        .then(reject)
        .catch(resolve)
    ));
  });

  it('it POSTs the event to the event store', () => {
    const writeToStream = streamWriter('http://0.0.0.0:2113', 'test-stream', auth, logger);

    const reqheaders = {
      Accept: 'application/vnd.eventstore.atom+json',
      'Content-Type': 'application/vnd.eventstore.events+json',
      'Content-Length': '97',
    };
    const eventStream = nock('http://0.0.0.0:2113', { reqheaders })
      .post('/streams/test-stream', body => (
        (body[0].eventId.match(/[0-9a-f-]{36}/) !== null) &&
        (body[0].eventType === 'SOME_EVENT') &&
        (body[0].data.amount === 7)
      ))
      .reply(201);

    return writeToStream({ type: 'SOME_EVENT', amount: 7 })
      .then(() => {
        expect(eventStream.isDone()).toBe(true);
      });
  });

  it('can send basic auth with the event', () => {
    const actualAuth = 'Basic c29tZV91c2VyOnNvbWVfcGFzc3dvcmQ=';
    const writeToStream = streamWriter('http://0.0.0.0:2113', 'auth-stream', actualAuth, logger);

    const reqheaders = { Authorization: 'Basic c29tZV91c2VyOnNvbWVfcGFzc3dvcmQ=' };
    const eventStream = nock('http://0.0.0.0:2113', { reqheaders })
      .post('/streams/auth-stream', () => true)
      .reply(201);

    return writeToStream({ type: 'SOME_EVENT' })
      .then(() => {
        expect(eventStream.isDone()).toBe(true);
      });
  });
});
