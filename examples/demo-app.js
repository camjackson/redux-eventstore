import express from 'express';
import bodyParser from 'body-parser';

import { createStore } from 'redux';
import { createStream } from '../src/index';

const logGreen = msg => console.log(`\x1b[32m${msg}\x1b[39m`);
const logBlue = msg => console.log(`\x1b[34m${msg}\x1b[39m`);

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// A server that subscribes to an Event Store stream, reducing its events to GET-able, in-memory state //
/////////////////////////////////////////////////////////////////////////////////////////////////////////
(() => {
  const stream = createStream('http://localhost:2113', 'demo-stream');

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
  const store = createStore(rootReducer);
  stream.subscribe(store.dispatch);

  const app = express();

  app.get('/amount', (req, res) => {
    res.send({ amount: store.getState() })
  });

  app.listen(8080);
})();

/////////////////////////////////////////////////////////////////////////////////////////////
// A server that receives events as POST requests and writes them to an Event Store stream //
/////////////////////////////////////////////////////////////////////////////////////////////
(() => {
  const stream = createStream('http://localhost:2113', 'demo-stream');

  // These are event creators, just like regular action creators:
  // http://redux.js.org/docs/basics/Actions.html#action-creators
  const add = amount => ({ type: 'ADD', amount });
  const multiply = amount => ({ type: 'MULTIPLY', amount });

  const app = express();
  app.use(bodyParser.json({ type: '*/*' }));

  app.post('/addEvent', (req, res) => {
    stream.write(add(req.body.amount));
    res.status(201).send('Created');
  });

  app.post('/multiplyEvent', (req, res) => {
    stream.write(multiply(req.body.amount));
    res.status(201).send('Created');
  });

  app.listen(8081);
})();

logBlue('\n------------');
logBlue('GET the reduced state from :8080! For example:');
logBlue('curl http://localhost:8080/amount');
logBlue("Modify demo-app.js if you'd like to see more detailed logging");

logGreen('\n------------');
logGreen('POST your events to :8081! For example:');
logGreen(`curl http://localhost:8081/addEvent -d '{"amount": 7 }'`);
logGreen(`curl http://localhost:8081/multiplyEvent -d '{"amount": 3 }'`);
logGreen("Modify demo-app.js if you'd like to see more detailed logging");
