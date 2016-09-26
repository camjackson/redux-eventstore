'use strict';

const { get, sleep } = require('./util');

async function subscribe(host, streamName, dispatch, pollPeriod=1000) {
  let index = 0;
  while (true) {
    try {
      const event = await get(`${host}/streams/${streamName}/${index}`);
      dispatch({ type: event.content.eventType, ...event.content.data });
      index++;
    } catch (e) {
      await sleep(pollPeriod);
    }
  }
}

const subscribeAsync = (host, streamName, dispatch) => (
  process.nextTick(() => subscribe(host, streamName, dispatch))
);

module.exports = subscribeAsync;
