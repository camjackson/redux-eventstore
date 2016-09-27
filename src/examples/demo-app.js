'use strict';

const http = require('http');
const { createStore, applyMiddleware } = require('redux');
const writeToStream = require('./../writeToStream');
const subscribeToStream = require('./../subscribeToStream');

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// A server that subscribes to an Event Store stream, reducing its events to GET-able, in-memory state //
/////////////////////////////////////////////////////////////////////////////////////////////////////////
(() => {
  const rootReducer = (state = 0, event) => {
    console.log('Reading event from stream:', event);
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

  const getReducedState = (req, res) => {
    if (req.url === '/amount' && req.method === 'GET') {
      const body = JSON.stringify({ amount: subscriberStore.getState() });

      res.writeHead(200, { 'Content-Length': Buffer.byteLength(body), 'Content-Type': 'application/json' });
      res.end(body);
    } else {
      res.statusCode = 404;
      res.statusMessage = 'Not found';
      res.end()
    }
  };

  http.createServer(getReducedState).listen(8080, () => {
    setTimeout(() => {
      console.log('\n------------');
      console.log('GET the reduced state from :8080! For example:');
      console.log('curl http://localhost:8080/amount');
    }, 1000);
  });
})();

/////////////////////////////////////////////////////////////////////////////////////
// A server that receives events as POST requests and writes them into Event Store //
/////////////////////////////////////////////////////////////////////////////////////
(() => {
  const storeWithMiddleware = createStore(
    state => state,
    applyMiddleware(writeToStream('http://localhost:2113', 'demo-stream'))
  );

  const writeToStore = (req, res) => {
    if (req.url === '/event' && req.method === 'POST') {
      let body = '';
      req.on('data', data => { body += data; });
      req.on('end', () => {
        const event = JSON.parse(body);
        console.log('Dispatching event:', event);
        storeWithMiddleware.dispatch(event);

        res.statusCode = 201;
        res.statusMessage = 'Created';
        res.end()
      });
    } else {
      res.statusCode = 404;
      res.statusMessage = 'Not found';
      res.end()
    }
  };

  http.createServer(writeToStore).listen(8081, () => {
    // Try to make these come after the logs from the other server. Async is hard.
    setTimeout(() => {
      console.log('\n------------');
      console.log('POST your events to :8081! For example:');
      console.log(`curl http://localhost:8081/event -d '{"type": "ADD", "amount": 7 }'`);
      console.log(`curl http://localhost:8081/event -d '{"type": "MULTIPLY", "amount": 3 }'`);
    }, 2000);
  });
})();
