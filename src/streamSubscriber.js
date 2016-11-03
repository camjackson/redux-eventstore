import { get, validate, sleep } from './util';

async function pollStream(host, stream, auth, logger, dispatch, pollPeriod) {
  let index = 0;
  logger(`Beginning subscription to host: ${host}, stream: ${stream}`);
  while (true) {
    try {
      const event = await get(`${host}/streams/${stream}/${index}`, auth, logger);
      logger(`Retrieved event from stream: ${JSON.stringify(event)}`);
      index++;
      if (event.content && event.content.eventType) {
        const reduxEvent = { type: event.content.eventType, ...event.content.data };
        logger(`Dispatching event: ${JSON.stringify(reduxEvent)}`);
        await dispatch(reduxEvent);
      }
    } catch (e) {
      logger(`Failed to retrieve event due to error: ${e}`);
      await sleep(pollPeriod);
    }
  }
}

const streamSubscriber = (host, stream, auth, logger) => (
  (dispatch, pollPeriod = 1000) => {
    validate(dispatch, 'dispatch', 'function', true);
    validate(pollPeriod, 'pollPeriod', 'number');

    pollStream(host, stream, auth, logger, dispatch, pollPeriod);
  }
);

export default streamSubscriber;
