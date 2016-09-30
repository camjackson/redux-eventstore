'use strict';

const uuid = require('uuid');
const { post, validate } = require('./util');

const streamWriter = (host, stream) => {
  validate(host, 'string', 'host missing or invalid', true);
  validate(stream, 'string', 'stream name missing or invalid', true);

  return event => {
    const { type, ...data } = event;
    post(`${host}/streams/${stream}`, [{ eventId: uuid.v4(), eventType: type, data }]);
  };
};
module.exports = streamWriter;
