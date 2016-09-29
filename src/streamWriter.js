'use strict';

const uuid = require('uuid');
const post = require('./util').post;

const streamWriter = (host, stream) => event => {
  const { type, ...data } = event;
  post(`${host}/streams/${stream}`, [{ eventId: uuid.v4(), eventType: type, data }]);
};
module.exports = streamWriter;
