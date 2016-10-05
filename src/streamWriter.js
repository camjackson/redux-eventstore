import uuid from 'uuid';
import { post, validate } from './util';

const defaultLogger = () => {};
const streamWriter = (host, stream, { logger=defaultLogger } = {}) => {
  validate(host, 'host', 'string', true);
  validate(stream, 'stream', 'string', true);
  validate(logger, 'logger', 'function', true);

  logger(`Creating event writer for host: ${host}, stream: ${stream}`);
  return event => {
    validate(event, 'event', 'object', true);
    validate(event.type, 'event type', 'string', true);
    const { type, ...data } = event;
    const eventForStream = [{ eventId: uuid.v4(), eventType: type, data }];
    logger(`Writing event: ${JSON.stringify(eventForStream)}`);
    return post(`${host}/streams/${stream}`, eventForStream, logger);
  };
};

export default streamWriter;
