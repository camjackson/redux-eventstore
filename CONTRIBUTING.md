# Contributing
Feature requests and bug reports are appreciated.

Pull requests are also welcome. Just make sure the linter and tests pass, and that you add tests for any new code.

This project uses [`yarn`](https://yarnpkg.com/) rather than the regular npm cli. You should use it too when working on
this project, especially when installing or adding dependencies. Just do `npm install -g yarn` to get it.

## Install
Install node v6, then install yarn, then clone and install package dependencies:
```sh
git clone ssh://git@github.com:camjackson/redux-eventstore
yarn
```

## Tests (in watch mode)
```sh
yarn test
```

## Linting
```sh
yarn lint
```

## Demo
```sh
yarn demo
```

You'll need a local Event Store running on port 2113 for the demo to work.
You can [install it natively](http://docs.geteventstore.com/introduction/3.9.0/), or you can use Docker:

```sh
sudo docker pull eventstore/eventstore
sudo docker run --name eventstore-node -it -p 2113:2113 -p 1113:1113 eventstore/eventstore
```

You can then inspect the event streams [in your browser](http://0.0.0.0:2113/web/index.html#/streams/demo-stream).
