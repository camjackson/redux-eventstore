import { get, validate, sleep } from './util';

async function pollStream(host, stream, dispatch, { pollPeriod, logger }) {
  let index = 0;
  logger(`Beginning subscription to host: ${host}, stream: ${stream}`);
  while (true) {
    try {
      const event = await get(`${host}/streams/${stream}/${index}`, logger);
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

const defaultPollPeriod = 1000;
const defaultLogger = () => {};
const subscribeToStream = (host, stream, dispatch, { pollPeriod=defaultPollPeriod, logger=defaultLogger } = {}) => {
  validate(host, 'host', 'string', true);
  validate(stream, 'stream', 'string', true);
  validate(dispatch, 'dispatch', 'function');
  validate(pollPeriod, 'pollPeriod', 'number');
  validate(logger, 'logger', 'function', true);

  return pollStream(host, stream, dispatch, { pollPeriod, logger });
};

export default subscribeToStream;
