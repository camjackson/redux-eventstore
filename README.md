# redux-eventstore
[![Build Status](https://snap-ci.com/camjackson/redux-eventstore/branch/master/build_image)](https://snap-ci.com/camjackson/redux-eventstore/branch/master)

Easily hook [redux](redux.js.org) up to [Event Store](https://geteventstore.com/), for easy CQRS and event sourcing with node.js. #buzzwordbingo

Core functionality is there, but probably not ready for production yet :)

TODO:
  - Docs
    - Mention actions vs events
  - Linting
  - ES6 modules?
  - Proper build steps
  - Make sure events aren't double-handled if a single store uses both `subscribeToStream` and `storeEvents`
     - Maybe just an option to make `storeEvents` swallow all events?
  - Better error handling everywhere
  - Logging (customisable levels?)
