'use strict';

const { get, validate, sleep } = require('./util');

async function pollStream(host, stream, dispatch, pollPeriod) {
  let index = 0;
  while (true) {
    try {
      const event = await get(`${host}/streams/${stream}/${index}`);
      dispatch({ type: event.content.eventType, ...event.content.data });
      index++;
    } catch (e) {
      await sleep(pollPeriod);
    }
  }
}

const subscribeToStream = (host, stream, dispatch, pollPeriod=1000) => {
  validate(host, 'string', 'host missing or invalid', true);
  validate(stream, 'string', 'stream name missing or invalid', true);
  validate(dispatch, 'function', 'dispatch callback missing or invalid');
  validate(pollPeriod, 'number', 'pollPeriod missing or invalid');

  return pollStream(host, stream, dispatch, pollPeriod);
};

module.exports = subscribeToStream;
