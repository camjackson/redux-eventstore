'use strict';
const http = require('http');
const url = require('url');

const headers = { Accept: 'application/json' };

const getLink = (payload, linkName) => payload.links.find(uri => uri.relation === linkName).uri;

const get = uri => (
  new Promise(resolve => (
    http.get({ ...url.parse(uri), headers }, res => {
      let body = '';
      res.on('data', data => { body += data; });
      res.on('end', () => { resolve(JSON.parse(body)); });
      //TODO: reject on errors
    })
  ))
);

let events = [];

async function main() {
  const stream = await get('http://0.0.0.0:2113/streams/newstream');
  let nextUri = getLink(stream, 'last');
  let page;

  do {
    page = await get(nextUri);
    events = events.concat(page.entries.reverse());
    nextUri = getLink(page, 'previous');
  } while(!page.headOfStream);

  console.log(events);
}

main();
