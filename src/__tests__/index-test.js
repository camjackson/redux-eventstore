import { createStream } from '../index';

describe('createStream', () => {
  it('it throws an error when host is not valid', () => {
    expect(() => createStream(null, 'test-stream')).toThrowError(/Invalid host/);
    expect(() => createStream({}, 'test-stream')).toThrowError(/Invalid host/);
    expect(() => createStream('', 'test-stream')).toThrowError(/Invalid host/);
  });

  it('it throws an error when stream name is invalid', () => {
    expect(() => createStream('localhost', {})).toThrowError(/Invalid stream/);
    expect(() => createStream('localhost', null)).toThrowError(/Invalid stream/);
    expect(() => createStream('localhost', '')).toThrowError(/Invalid stream/);
  });

  it('it throws an error when auth is invalid', () => {
    expect(() => createStream('localhost', 'test-stream', { auth: 'one' })).toThrowError(/Invalid auth/);
    expect(() => createStream('localhost', 'test-stream', { auth: {} })).toThrowError(/Invalid auth/);
    expect(() => createStream('localhost', 'test-stream', { auth: { user: 5, pass: 'p4ss' } })).toThrowError(/Invalid auth.user/);
    expect(() => createStream('localhost', 'test-stream', { auth: { user: 'user', pass: {} } })).toThrowError(/Invalid auth.pass/);
  });

  it('it throws an error when logger is invalid', () => {
    expect(() => createStream('localhost', 'test-stream', { logger: null })).toThrowError(/Invalid logger/);
    expect(() => createStream('localhost', 'test-stream', { logger: {} })).toThrowError(/Invalid logger/);
    expect(() => createStream('localhost', 'test-stream', { logger: 'one' })).toThrowError(/Invalid logger/);
  });

  it('passes undefined auth when no auth is given', () => {
    jest.mock('../streamWriter');
    jest.mock('../streamSubscriber');

    const streamWriter = require('../streamWriter');
    const streamSubscriber = require('../streamSubscriber');

    const logger = () => {};
    createStream('localhost', 'test-stream', { logger });

    expect(streamWriter.default).toBeCalledWith('localhost', 'test-stream', undefined, logger);
    expect(streamSubscriber.default).toBeCalledWith('localhost', 'test-stream', undefined, logger);
  });

  it('encodes the auth when auth is given', () => {
    jest.mock('../streamWriter');
    jest.mock('../streamSubscriber');

    const streamWriter = require('../streamWriter');
    const streamSubscriber = require('../streamSubscriber');

    const logger = () => {};
    const auth = { user: 'some_user', pass: 'some_password' };
    createStream('localhost', 'test-stream', { auth, logger });

    expect(streamWriter.default).toBeCalledWith('localhost', 'test-stream', 'Basic c29tZV91c2VyOnNvbWVfcGFzc3dvcmQ=', logger);
    expect(streamSubscriber.default).toBeCalledWith('localhost', 'test-stream', 'Basic c29tZV91c2VyOnNvbWVfcGFzc3dvcmQ=', logger);
  });
});
