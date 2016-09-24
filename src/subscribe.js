'use strict';

const get = require('./util').get;

const getLink = (payload, relation) => {
  const link = payload.links.find(uri => uri.relation === relation);
  return link && link.uri;
};

async function subscribe(host, streamName, dispatch) {
  const stream = await get(`${host}/streams/${streamName}`);
  //If there's only one page, then there won't be a 'last' link.
  let nextUri = getLink(stream, 'last') || getLink(stream, 'self');

  while (true) {
    const page = await get(nextUri);
    page.entries.reverse().forEach(async function (event) {
      dispatch(await get(event.id));
    });
    nextUri = getLink(page, 'previous');

    if (page.headOfStream) break;
  }
}

module.exports = subscribe;
