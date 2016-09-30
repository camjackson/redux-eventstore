'use strict';

const nock = require('nock');
const streamWriter = require('../streamWriter');

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

test('it throws an error when an event has an invalid type', () => {
  const writeToStream = streamWriter('localhost', 'test-stream');

  expect(() => writeToStream({ type: '' })).toThrowError(/Invalid event type/);
  expect(() => writeToStream({ type: null })).toThrowError(/Invalid event type/);
  expect(() => writeToStream({ type: {} })).toThrowError(/Invalid event type/);
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

  writeToStream({ type: 'SOME_EVENT', amount: 7 });

  expect(eventStream.isDone()).toBe(true);
});
