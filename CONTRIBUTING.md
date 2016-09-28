# Contributing
Feature requests and bug reports are appreciated.

Pull requests are also welcome:
 - Please try to match the existing code style of the project
 - Please add automated tests for any new code

## Install
Install node v6, then clone and install package dependencies:
```sh
git clone ssh://git@github.com:camjackson/redux-eventstore
npm install
```

## Tests
Run with watching (for development):
```sh
npm test
```

Run once (for CI):
```sh
npm run test-once
```

## Demo
Run the demo with:
```sh
npm start
```

You'll need a local Event Store running on port 2113 for the demo to work.
You can [install it natively](http://docs.geteventstore.com/introduction/3.9.0/), or you can use Docker:

```sh
docker pull eventstore/eventstore
docker run --name eventstore-node -it -p 2113:2113 -p 1113:1113 eventstore/eventstore
```

You can inspect the event streams [in your browser](http://0.0.0.0:2113/web/index.html#/streams/demo-stream), too.
