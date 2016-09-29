'use strict';

require('babel-polyfill');

const streamWriter = require('./streamWriter');
const subscribeToStream = require('./subscribeToStream');

module.exports = {
  streamWriter, subscribeToStream
};
