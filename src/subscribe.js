'use strict';

const { get, sleep } = require('./util');

async function subscribe(host, streamName, dispatch) {
  let index = 0;
  while (true) {
    try {
      const event = await get(`${host}/streams/${streamName}/${index}`);
      dispatch({ type: event.content.eventType, ...event.content.data });
      index++;
    } catch (e) {
      await sleep(1000);
    }
  }
}

const subscribeAsync = (host, streamName, dispatch) => (
  process.nextTick(() => subscribe(host, streamName, dispatch))
);

module.exports = subscribeAsync;
