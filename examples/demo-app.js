'use strict';

const http = require('http');
const { createStore } = require('redux');
const { streamWriter, subscribeToStream } = require('../src/index');

const notFound = res => {
  res.statusCode = 404;
  res.statusMessage = 'Not found';
  res.end()
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// A server that subscribes to an Event Store stream, reducing its events to GET-able, in-memory state //
/////////////////////////////////////////////////////////////////////////////////////////////////////////
(() => {
  const rootReducer = (state = 0, event) => {
    switch(event.type) {
      case 'ADD':
        return state + event.amount;
      case 'MULTIPLY':
        return state * event.amount;
      default:
        return state;
    }
  };
  const subscriberStore = createStore(rootReducer);
  subscribeToStream('http://localhost:2113', 'demo-stream', subscriberStore.dispatch);

  const server = (req, res) => {
    if (req.url === '/amount' && req.method === 'GET') {
      const body = JSON.stringify({ amount: subscriberStore.getState() });

      res.writeHead(200, { 'Content-Length': Buffer.byteLength(body), 'Content-Type': 'application/json' });
      res.end(body);
    } else {
      notFound(res);
    }
  };

  http.createServer(server).listen(8080, () => {
    setTimeout(() => {
      console.log('\n------------');
      console.log('GET the reduced state from :8080! For example:');
      console.log('curl http://localhost:8080/amount');
    }, 1000);
  });
})();

/////////////////////////////////////////////////////////////////////////////////////////////
// A server that receives events as POST requests and writes them to an Event Store stream //
/////////////////////////////////////////////////////////////////////////////////////////////
(() => {
  const writeToStream = streamWriter('http://localhost:2113', 'demo-stream');

  // These are event creators, just like regular action creators:
  // http://redux.js.org/docs/basics/Actions.html#action-creators
  const add = amount => ({ type: 'ADD', amount });
  const multiply = amount => ({ type: 'MULTIPLY', amount });

  const server = (req, res) => {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', data => { body += data; });
      req.on('end', () => {
        const amount = JSON.parse(body).amount;

        if (req.url === '/addEvent') {
          writeToStream(add(amount));
        } else if(req.url === '/multiplyEvent') {
          writeToStream(multiply(amount));
        } else {
          notFound(res);
        }

        res.statusCode = 201;
        res.statusMessage = 'Created';
        res.end()
      });
    } else {
      notFound(res);
    }
  };

  http.createServer(server).listen(8081, () => {
    // Try to make these come after the logs from the other server. Async is hard.
    setTimeout(() => {
      console.log('\n------------');
      console.log('POST your events to :8081! For example:');
      console.log(`curl http://localhost:8081/addEvent -d '{"amount": 7 }'`);
      console.log(`curl http://localhost:8081/multiplyEvent -d '{"amount": 3 }'`);
    }, 2000);
  });
})();
