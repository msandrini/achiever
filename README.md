[![CircleCI](https://circleci.com/gh/msandrini/achiever/tree/master.svg?style=svg)](https://circleci.com/gh/msandrini/achiever/tree/master)
[![Build status](https://ci.appveyor.com/api/projects/status/0be6ila7s2cb2dy7/branch/master?svg=true)](https://ci.appveyor.com/project/msandrini/achiever/branch/master)
[![codecov](https://codecov.io/gh/msandrini/achiever/branch/master/graph/badge.svg)](https://codecov.io/gh/msandrini/achiever)
[![Maintainability](https://api.codeclimate.com/v1/badges/1fcecced8c9eb95d81bc/maintainability)](https://codeclimate.com/github/msandrini/achiever/maintainability)
[![Greenkeeper badge](https://badges.greenkeeper.io/msandrini/achiever.svg)](https://greenkeeper.io/)

# Achiever

A tool built to... _Achieve!_

## Dependencies

- node
- npm

## Install

```
npm install
```

## Run

```
npm start
```

## Watch

```
npm run watch
```

## Open

Go to [localhost:3000](http://localhost:3000).

## Docker

### Build the container

```
npm run docker:build
```

### Run

```
docker-compose up -d
```

### Stop

```
docker-compose down
```

### Logs

```
docker logs -ft achiever_app_1
```

## Contributing

Send your PR now!

## CLI

`node server/cli.js` - time set in sequence, when it send 4 it triggers the "send to server" routine _(not ready yet, of course)_
`node server/cli.js <keyword> <00:00>` - specific time set, for a period specified in the keyword _(see keywords for each phase in strings.js)_
`node server/cli.js clear` - clear times _(there are some other keywords for this as well)_

### TODO

_Refer to the project section on GitHub_
