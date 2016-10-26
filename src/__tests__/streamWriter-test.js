import nock from 'nock';
import streamWriter from '../streamWriter';

it('it throws an error when host is not valid', () => {
  expect(() => streamWriter(null, 'test-stream')).toThrowError(/Invalid host/);
  expect(() => streamWriter({}, 'test-stream')).toThrowError(/Invalid host/);
  expect(() => streamWriter('', 'test-stream')).toThrowError(/Invalid host/);
});

it('it throws an error when stream name is invalid', () => {
  expect(() => streamWriter('localhost', {})).toThrowError(/Invalid stream/);
  expect(() => streamWriter('localhost', null)).toThrowError(/Invalid stream/);
  expect(() => streamWriter('localhost', '')).toThrowError(/Invalid stream/);
});

it('it throws an error when logger is invalid', () => {
  expect(() => streamWriter('localhost', 'test-stream', { logger: null })).toThrowError(/Invalid logger/);
  expect(() => streamWriter('localhost', 'test-stream', { logger: {} })).toThrowError(/Invalid logger/);
  expect(() => streamWriter('localhost', 'test-stream', { logger: 'one' })).toThrowError(/Invalid logger/);
});

it('it throws an error when auth is invalid', () => {
  expect(() => streamWriter('localhost', 'test-stream', { auth: 'one' })).toThrowError(/Invalid auth/);
  expect(() => streamWriter('localhost', 'test-stream', { auth: {} })).toThrowError(/Invalid auth/);
  expect(() => streamWriter('localhost', 'test-stream', { auth: { user: 5, pass: 'p4ss' } })).toThrowError(/Invalid auth.user/);
  expect(() => streamWriter('localhost', 'test-stream', { auth: { user: 'user', pass: {} } })).toThrowError(/Invalid auth.pass/);
});

it('it throws an error when the event is invalid', () => {
  const writeToStream = streamWriter('localhost', 'test-stream');

  expect(() => writeToStream('')).toThrowError(/Invalid event/);
  expect(() => writeToStream(null)).toThrowError(/Invalid event/);
  expect(() => writeToStream('hello')).toThrowError(/Invalid event/);
});

it('it throws an error when the event type is invalid', () => {
  const writeToStream = streamWriter('localhost', 'test-stream');

  expect(() => writeToStream({ type: '' })).toThrowError(/Invalid event type/);
  expect(() => writeToStream({ type: null })).toThrowError(/Invalid event type/);
  expect(() => writeToStream({ type: {} })).toThrowError(/Invalid event type/);
});

it('it rejects when the server returns an error', () => {
  const writeToStream = streamWriter('localhost', 'error-stream');

  return new Promise((resolve, reject) => (
    writeToStream({ type: 'SOME_EVENT' })
      .then(reject)
      .catch(resolve)
  ));
});

it('it POSTs the event to the event store', () => {
  const writeToStream = streamWriter('http://0.0.0.0:2113', 'test-stream');

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
  const auth = { user: 'some_user', pass: 'some_password' };
  const writeToStream = streamWriter('http://0.0.0.0:2113', 'auth-stream', { auth });

  const reqheaders = { Authorization: 'Basic c29tZV91c2VyOnNvbWVfcGFzc3dvcmQ=' };
  const eventStream = nock('http://0.0.0.0:2113', { reqheaders })
    .post('/streams/auth-stream', () => true)
    .reply(201);

  return writeToStream({ type: 'SOME_EVENT' })
    .then(() => {
      expect(eventStream.isDone()).toBe(true);
    });
});
