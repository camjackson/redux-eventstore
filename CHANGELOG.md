# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Added
- Project setup, build process, docs, etc
- `subscribeToStream`
  - Pages through all existing events on a stream, dispatching them as redux actions
  - Polls for new events, and dispatches those as they come in too
- `writeToStream`
  - Writes all dispatched redux actions to a stream
