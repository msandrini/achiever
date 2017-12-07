# Achiever

A tool built to... _Achieve!_

## Dependencies

- node
- npm

## Install

    npm install

## Run

    npm run build && npm run serve

or

    npm start

## Watch

In a terminal window:

    npm run watch

And in another:

    npm run serve

## Open

Go to [localhost:3000](http://localhost:3000).

## Contributing

## CLI

`node server/cli.js` - time set in sequence, when it send 4 it triggers the "send to server" routine _(not ready yet, of course)_
`node server/cli.js <keyword> <00:00>` - specific time set, for a period specified in the keyword _(buggy, see below)_
`node server/cli.js clear` - clear times _(there are some other keywords for this as well)_

### TODO

- Integrate backend call to send date/time
- Integrate backend call to verify times for a day (hopefully to retrieve the hours for a week as well, maybe in another call)
- Command-line tool _(the sequential time set works fine but the specific time set clears other times when it shouldn't)_
- Env vars for server address and login info _(actual implementation, example file created and package dotenv installed)_
