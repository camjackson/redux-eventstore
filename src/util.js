import http from 'http';
import url from 'url';

const eventsJson = 'application/vnd.eventstore.events+json';
const atomJson = 'application/vnd.eventstore.atom+json';

const handleResult = (resolve, reject, logger) => res => {
  logger(`Response status: ${res.statusCode} - ${res.statusMessage}`);
  const done = res.statusCode >= 200 && res.statusCode < 300 ? resolve : reject;
  let body = '';
  res.on('data', data => { body += data; });
  res.on('end', () => done(body && JSON.parse(body)));
};

export const get = (uri, auth, logger) => (
  new Promise((resolve, reject) => {
    logger(`HTTP GET ${uri}`);
    const headers = { Accept: atomJson, 'Content-Type': '1' };
    if (auth) {
      headers.Authorization = auth;
    }

    const req = http.get({ ...url.parse(uri), headers }, handleResult(resolve, reject, logger));

    req.on('error', reject);
  })
);

export const post = (uri, body, auth, logger) => (
  new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const headers = { 'Accept': atomJson, 'Content-Type': eventsJson, 'Content-Length': Buffer.byteLength(data) };
    if (auth) {
      headers.Authorization = auth;
    }

    logger(`HTTP POST: ${uri}, ${data}`);
    const req = http.request({ ...url.parse(uri), method: 'POST', headers }, handleResult(resolve, reject, logger));

    req.on('error', reject);

    req.write(data);
    req.end();
  })
);

export const encodeAuth = auth => `Basic ${new Buffer(`${auth.user}:${auth.pass}`).toString('base64')}`;

export const validate = (value, name, type, required=false) => {
  if (typeof value !== type || (required && !value)) {
    throw new Error(`Invalid ${name}: ${value}`);
  }
};

export const sleep = duration => (
  new Promise(resolve => setTimeout(resolve, duration))
);
