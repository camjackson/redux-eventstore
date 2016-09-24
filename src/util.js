'use strict';

const http = require('http');
const url = require('url');

const json = 'application/json';
const eventJson = 'application/vnd.eventstore.events+json';

const handleResult = resolve => res => {
  let body = '';
  res.on('data', data => { body += data; });
  res.on('end', () => resolve(body && JSON.parse(body)));
};

const get = uri => (
  new Promise(resolve => (
    http.get({ ...url.parse(uri), headers: { Accept: json } }, handleResult(resolve))
  ))
);

const post = (uri, body) => (
  new Promise(resolve => {
    const writable = JSON.stringify(body);
    const headers = { 'Accept': json, 'Content-Type': eventJson, 'Content-Length': Buffer.byteLength(writable) };

    const req = http.request({ ...url.parse(uri), method: 'POST', headers }, handleResult(resolve));
    req.write(writable);
    req.end();
  })
);

module.exports = { get, post };
