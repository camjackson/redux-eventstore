'use strict';

const nock = require('nock');
const streamWriter = require('../streamWriter');

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
