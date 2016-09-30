'use strict';

const uuid = require('uuid');
const { post, validate } = require('./util');

const streamWriter = (host, stream) => {
  validate(host, 'host', 'string', true);
  validate(stream, 'stream', 'string', true);

  return event => {
    validate(event.type, 'event type', 'string', true);
    const { type, ...data } = event;
    post(`${host}/streams/${stream}`, [{ eventId: uuid.v4(), eventType: type, data }]);
  };
};
module.exports = streamWriter;
