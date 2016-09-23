'use strict';

const get = require('./util').get;

const getLink = (payload, linkName) => payload.links.find(uri => uri.relation === linkName).uri;

async function subscribe(host, streamName, store) {
  const stream = await get(`${host}/streams/${streamName}`);
  let nextUri = getLink(stream, 'last');
  let page;

  do {
    page = await get(nextUri);
    page.entries.reverse().forEach(store.dispatch);
    nextUri = getLink(page, 'previous');
  } while(!page.headOfStream);
}

module.exports = subscribe;