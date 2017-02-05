# redux-eventstore
[![Build Status](https://snap-ci.com/camjackson/redux-eventstore/branch/master/build_image)](https://snap-ci.com/camjackson/redux-eventstore/branch/master)

*CQRS, event sourcing, and event collaboration made easy with Node.js, Redux, and Event Store!*

Use this library on your Node.js backend to easily write Redux-style events ([usually known as actions](#events-vs-actions))
to an [Event Store](https://geteventstore.com/) stream. You can also subscribe a Redux store (still on the backend) to
the stream, allowing you to page through all the events and reduce it to the current, in-memory state. You can then
query that state in response to API requests, to provide data to a client (for example).

*(These docs assume some familiarity with Redux. If concepts like actions and reducers are new to you, you may first
want to go check out the official [Redux docs](http://redux.js.org).)*


```js
import { createStream } from 'redux-eventstore';
import { createStore } from 'redux';
import rootReducer from './reducers';

// Initalise a stream object, which we'll use to write or subscribe to an Event Store stream. You would
// typically do this once, when your application starts up. Think of it like a database connection.
const stream = createStream('http://localhost:2113', 'my-stream');


// Write an event to the stream. This might be triggered by an POST request from your frontend, a
// nightly batch job, in response to another event that was read off the stream, etc. The event object
// is given inline here, but it's a good idea to write redux action creators, so that the type and
// structure of your events is abstracted away.
stream.write({ type: 'USER_CREATED', name: "Jane Smith" });


// Create a Redux store that will receive all events read from the stream. This too, would be done once,
// at app start up. The given reducer function will process the events, calculating the reduced state.
const store = createStore(rootReducer);


// Subscribe the Redux store to the event stream. It will quickly iterate through all existing events,
// and then poll forever. Each event is dispatched, synchronously, in order. The store's reducers will
// calculate state based on the events.
stream.subscribe(store.dispatch);


// Get the current state of the in-memory store. We might do this to respond to a GET request.
const currentState = store.getState();
```

For a full example, see [`demo-app.js`](https://github.com/camjackson/redux-eventstore/blob/master/examples/demo-app.js).
It shows two Express.js apps communicating asynchronously via Event Store:
 - one receives events via POST request and writes to a stream
 - the other subscribes to the stream, aggregates the state, and exposes it via GET request.

## API

### `createStream(host, stream)`

Initialises a stream object, for subscribing or writing to the Event Store.

**Parameters:**

 - `host` *(String)*: The host where your Event Store is located. Include the scheme (protocol), FQDN, and port
 - `stream` *(String)*: The name of the stream to subscribe to
 - [`opts`] *(Object)*: Other, optional configuration:
   - [`logger`] *(Function(`msg`)*: A function that will be invoked with log messages
   - [`auth`] *(Object)*: Basic auth credentials
     - `user` *(String)*: The EventStore username
     - `pass` *(String)*: The user's password

**Returns:**

A stream object with the two methods documented below.

### `stream.write(event)`

Writes an event to the stream. If you write an event using this method, don't also dispatch it to your store manually.
Instead, use the subscribe method below to have your store read the event back off the stream. This will help ensure
consistency across subscribers, especially in cases where events fail to write to the stream, or when multiple writes
happen in quick succession, from different sources.

**Parameters:**

  - `event` *(Object)*: The event to write to the store. Must have a `type` property, as a non-empty string.

**Returns:**

*(Promise)* Resolves or rejects based on the server response.

### `stream.subscribe(dispatch, [pollPeriod=1000], [includeMetadata=false])`

Subscribes to an Event Store stream, dispatching all events from that stream to your redux store. Initially, all previous
events will be played through as fast as possible, after which the stream will be polled for new events periodically.
Events are dispatched synchronously, in the order in which they appear in the stream.

Note: If an error occurs when dispatching an event, the subscription loop will ignore it, and move on to the next event
in the stream.

**Parameters:**

 - `dispatch` *(Function(`event`))*: The callback function that will receive each event read off the stream
 - [`pollPeriod`] *(Number)*: How many milliseconds to wait between polls of the stream (*default: 1000*)
 - [`includeMetadata`] *(Boolean)*: Whether to include any event metadata (*default: false*).

## Events vs. actions
Typically with redux, you dispatch **actions**, which are imperatively named. For example: `CREATE_USER`. This makes
sense when you are *asking* for something to happen, and some other part of the application (e.g. a reducer) is going to
handle the request.

However, with Event Store (or event sourcing in general), it makes more sense to talk about **events** in the past tense,
representing something that has already happened. For example: `USER_CREATED`.
[More explanation here](http://docs.geteventstore.com/introduction/3.9.0/event-sourcing-basics/).

This is why the `redux-eventstore` docs, examples, and source code all refer to events, rather than actions. You should
keep this in mind when using it.
