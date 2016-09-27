'use strict';

require('babel-polyfill');

const writeToStream = require('./writeToStream');
const subscribeToStream = require('./subscribeToStream');

module.exports = {
  writeToStream, subscribeToStream
};
