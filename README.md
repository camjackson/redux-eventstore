# redux-eventstore
Redux middleware for reading and writing actions to Event Store

Core functionality is present, but this should be considered very unstable.

Do not use in production yet :)

TODO:
 - Docs
 - Proper tests
    - CI
 - ES6 modules?
 - Proper build steps
 - Make sure events aren't double-handled if a store uses `subscribe` and `middleware`
    - Maybe just an option to make `middleware` swallow all events?
 - Make the wait time customisable in `subcribe`
 - Better error handling everywhere
 - Logging (customisable levels?)

Docker commands:

```sh
docker pull eventstore/eventstore
docker run --name eventstore-node -it -p 2113:2113 -p 1113:1113 eventstore/eventstore
```
