'use strict';

const { get, sleep } = require('./util');

async function subscribeToStream(host, stream, dispatch, pollPeriod=1000) {
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

const subscribeToStreamAsync = (host, streamName, dispatch) => (
  process.nextTick(() => subscribeToStream(host, streamName, dispatch))
);

module.exports = subscribeToStreamAsync;
