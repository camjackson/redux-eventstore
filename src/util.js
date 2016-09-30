import http from 'http';
import url from 'url';

const eventsJson = 'application/vnd.eventstore.events+json';
const atomJson = 'application/vnd.eventstore.atom+json';

const handleResult = (resolve, reject) => res => {
  const done = res.statusCode >= 200 && res.statusCode < 300 ? resolve : reject;
  let body = '';
  res.on('data', data => { body += data; });
  res.on('end', () => done(body && JSON.parse(body)));
};

export const get = uri => (
  new Promise((resolve, reject) => (
    http.get({ ...url.parse(uri), headers: { Accept: atomJson } }, handleResult(resolve, reject))
  ))
);

export const post = (uri, body) => (
  new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const headers = { 'Accept': atomJson, 'Content-Type': eventsJson, 'Content-Length': Buffer.byteLength(data) };

    const req = http.request({ ...url.parse(uri), method: 'POST', headers }, handleResult(resolve, reject));

    req.on('error', reject);

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
