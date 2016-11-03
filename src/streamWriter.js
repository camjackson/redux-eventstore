import uuid from 'uuid';
import { post, validate } from './util';

const streamWriter = (host, stream, auth, logger) => (
  event => {
    validate(event, 'event', 'object', true);
    validate(event.type, 'event type', 'string', true);

    const { type, ...data } = event;
    const eventForStream = [{ eventId: uuid.v4(), eventType: type, data }];
    logger(`Writing event: ${JSON.stringify(eventForStream)}`);
    return post(`${host}/streams/${stream}`, auth, logger, eventForStream);
  }
);

export default streamWriter;
