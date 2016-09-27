# redux-eventstore
[![Build Status](https://snap-ci.com/camjackson/redux-eventstore/branch/master/build_image)](https://snap-ci.com/camjackson/redux-eventstore/branch/master)

Easily hook [redux](https://redux.js.org) up to [Event Store](https://geteventstore.com/), for easy CQRS and event sourcing with node.js. #buzzwordbingo

Core functionality is there, but probably not ready for production yet :)

TODO:
  - Docs
    - Mention actions vs events
  - Linting
  - ES6 modules?
  - Make sure events aren't double-handled if a single store uses both `subscribeToStream` and `writeToStream`
     - Maybe just an option to make `writeToStream` swallow all events?
  - Better error handling everywhere
  - Logging (customisable levels?)
    - Idea: callback params for info logging and debug logging!
  - Test different engines, and document what works/doesn't
