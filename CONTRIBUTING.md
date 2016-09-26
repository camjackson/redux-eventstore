# Contributing
Pull requests are welcome.
 - Please try to match the existing code style of the project
 - Please add automated tests for any new code

## Setup
Install node v6, then clone and install package dependencies
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

## Testing against a real Event Store instance
It's up to you how you want to run Event Store locally, but personally I use the official
docker image:

```sh
docker pull eventstore/eventstore
docker run --name eventstore-node -it -p 2113:2113 -p 1113:1113 eventstore/eventstore
```
