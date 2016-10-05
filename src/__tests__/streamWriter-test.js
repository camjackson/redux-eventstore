import nock from 'nock';
import streamWriter from '../streamWriter';

test('it throws an error when host is not valid', () => {
  expect(() => streamWriter(null, 'test-stream')).toThrowError(/Invalid host/);
  expect(() => streamWriter({}, 'test-stream')).toThrowError(/Invalid host/);
  expect(() => streamWriter('', 'test-stream')).toThrowError(/Invalid host/);
});

test('it throws an error when stream name is invalid', () => {
  expect(() => streamWriter('localhost', {})).toThrowError(/Invalid stream/);
  expect(() => streamWriter('localhost', null)).toThrowError(/Invalid stream/);
  expect(() => streamWriter('localhost', '')).toThrowError(/Invalid stream/);
});

test('it throws an error when logger is invalid', () => {
  expect(() => streamWriter('localhost', 'test-stream', { logger: null })).toThrowError(/Invalid logger/);
  expect(() => streamWriter('localhost', 'test-stream', { logger: {} })).toThrowError(/Invalid logger/);
  expect(() => streamWriter('localhost', 'test-stream', { logger: 'one' })).toThrowError(/Invalid logger/);
});

test('it throws an error when the event is invalid', () => {
  const writeToStream = streamWriter('localhost', 'test-stream');

  expect(() => writeToStream('')).toThrowError(/Invalid event/);
  expect(() => writeToStream(null)).toThrowError(/Invalid event/);
  expect(() => writeToStream('hello')).toThrowError(/Invalid event/);
});

test('it throws an error when the event type is invalid', () => {
  const writeToStream = streamWriter('localhost', 'test-stream');

  expect(() => writeToStream({ type: '' })).toThrowError(/Invalid event type/);
  expect(() => writeToStream({ type: null })).toThrowError(/Invalid event type/);
  expect(() => writeToStream({ type: {} })).toThrowError(/Invalid event type/);
});

test('it rejects when the server returns an error', () => {
  const writeToStream = streamWriter('localhost', 'error-stream');

  return new Promise((resolve, reject) => (
    writeToStream({ type: 'SOME_EVENT' })
      .then(reject)
      .catch(resolve)
  ));
});

test('it POSTs the event to the event store', () => {
  const writeToStream = streamWriter('http://0.0.0.0:2113', 'test-stream');

  const eventStream = nock('http://0.0.0.0:2113', {
    reqheaders: {
      Accept: 'application/vnd.eventstore.atom+json',
      'Content-Type': 'application/vnd.eventstore.events+json',
      'Content-Length': '97',
    }})
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
