const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { graphiqlExpress } = require('apollo-server-express');
const logger = require('./logger');
const api = require('./api');
require('./dummyServer');

const app = express();
const getFromRoot = file => path.resolve(__dirname, `../${file}`);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api', bodyParser.json(), api);
app.use('/graphiql', graphiqlExpress({ endpointURL: '/api' }));

// dynamic

app.get('/times', (req, res) => {
	const values = { a: 1 };
	res.json(values);
});
app.post('/times', (req, res) => {
	logger.info('server received:');
	logger.info(JSON.stringify(req.body));
	res.json({ success: true });
});

// static
app.use('/assets', express.static(getFromRoot('client/assets')));

app.get('/', (req, res) => {
	res.sendFile(getFromRoot('client/index.htm'));
});
app.get('/app.js', (req, res) => {
	res.sendFile(getFromRoot('client/dist/app.js'));
});

app.listen(3000, () =>
	logger.info('listening on 3000!'));
