# redux-eventstore
[![Build Status](https://snap-ci.com/camjackson/redux-eventstore/branch/master/build_image)](https://snap-ci.com/camjackson/redux-eventstore/branch/master)

Redux middleware for reading and writing actions to [Event Store](https://geteventstore.com/)

Core functionality is present, but this should be considered very unstable.

Do not use in production yet :)

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
