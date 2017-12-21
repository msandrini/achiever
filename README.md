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

Send your PR now!

## CLI

`node server/cli.js` - time set in sequence, when it send 4 it triggers the "send to server" routine _(not ready yet, of course)_
`node server/cli.js <keyword> <00:00>` - specific time set, for a period specified in the keyword _(see keywords for each phase in strings.js)_
`node server/cli.js clear` - clear times _(there are some other keywords for this as well)_

### TODO

- On Client:
    - Integrate call to send times (Edit, Today)
    - Integrate backend call to verify times for a day (hopefully to retrieve the hours for a week as well, maybe in another call)
    - Integrate call to verify remaining hours
    - Integrate login/logout
- On CLI: do an integrated test
- On Server: 
    - Login/logout
    - Logger
    - Fixed time on remaining hours (supposed to take info from the web-based report)