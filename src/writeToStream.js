'use strict';

const uuid = require('uuid');
const post = require('./util').post;

const subscribeToStream = (host, stream) => store => next => event => {
  const { type, ...data } = event;
  post(`${host}/streams/${stream}`, [{ eventId: uuid.v4(), eventType: type, data }]);
  next(event);
};
module.exports = subscribeToStream;
