import http from 'http';
import url from 'url';

const eventsJson = 'application/vnd.eventstore.events+json';
const atomJson = 'application/vnd.eventstore.atom+json';

const handleResult = resolve => res => {
  let body = '';
  res.on('data', data => { body += data; });
  res.on('end', () => resolve(body && JSON.parse(body)));
};

export const get = uri => (
  new Promise(resolve => (
    http.get({ ...url.parse(uri), headers: { Accept: atomJson } }, handleResult(resolve))
  ))
);

export const post = (uri, body) => (
  new Promise(resolve => {
    const data = JSON.stringify(body);
    const headers = { 'Accept': atomJson, 'Content-Type': eventsJson, 'Content-Length': Buffer.byteLength(data) };

    const req = http.request({ ...url.parse(uri), method: 'POST', headers }, handleResult(resolve));
    req.write(data);
    req.end();
  })
);

export const validate = (value, name, type, required=false) => {
  if (typeof value !== type || (required && !value)) {
    throw new Error(`Invalid ${name}: ${value}`);
  }
};

export const sleep = duration => (
  new Promise(resolve => setTimeout(resolve, duration))
);
