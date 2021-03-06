import 'babel-polyfill';

import { validate, encodeAuth } from './util';
import streamWriter from './streamWriter';
import streamSubscriber from './streamSubscriber';

const defaultLogger = () => {};

export const createStream = (host, stream, { auth = null, logger = defaultLogger } = {}) => {
  validate(host, 'host', 'string', true);
  validate(stream, 'stream', 'string', true);
  validate(logger, 'logger', 'function', true);
  validate(auth, 'auth', 'object');
  let encodedAuth;
  if (auth) {
    validate(auth.user, 'auth.user', 'string', true);
    validate(auth.pass, 'auth.pass', 'string', true);
    encodedAuth = encodeAuth(auth);
  }

  logger(`Creating stream object for host: ${host}, stream: ${stream}`);

  return {
    write: streamWriter(host, stream, encodedAuth, logger),
    subscribe: streamSubscriber(host, stream, encodedAuth, logger),
  };
};
