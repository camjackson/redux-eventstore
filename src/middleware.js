'use strict';

const uuid = require('uuid');
const post = require('./util').post;

module.exports = (host, streamName) => store => next => action => {
  post(`${host}/streams/${streamName}`, [{
    eventId: uuid.v4(),
    eventType: 'defaultType',
    data: action,
  }]);
  next(action);
};
