'use strict';

const { get, sleep } = require('./util');

async function pollStream(host, stream, dispatch, pollPeriod=1000) {
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

const subscribeToStream = (host, stream, dispatch) => {
  if (!host || typeof host !== 'string') {
    throw new Error('Event Store host missing or invalid');
  }
  if (!stream || typeof stream !== 'string') {
    throw new Error('Event Store stream name missing or invalid');
  }
  if (typeof dispatch !== 'function') {
    throw new Error('Event Store stream name missing or invalid');
  }
  return pollStream(host, stream, dispatch);
};

module.exports = subscribeToStream;
