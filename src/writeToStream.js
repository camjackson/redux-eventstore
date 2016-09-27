'use strict';

const uuid = require('uuid');
const post = require('./util').post;

const subscribeToStream = (host, streamName) => store => next => action => {
  const { type, ...rest } = action;
  const event = { eventId: uuid.v4(), eventType: type, data: rest };
  post(`${host}/streams/${streamName}`, [event]);
  next(action);
};
module.exports = subscribeToStream;
