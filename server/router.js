const { graphiqlExpress } = require('apollo-server-express');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const api = require('./api');
const { tokenFactory } = require('./api/middleware');
const logger = require('./logger');

const getFromRoot = file => path.resolve(__dirname, `../${file}`);

module.exports = (app) => {
	app.use('/api', bodyParser.json(), api);
	app.use('/graphiql', graphiqlExpress({
		endpointURL: '/api',
		passHeader: `'Authorization': 'bearer ${tokenFactory()}'`
	}));

	// dynamic
	app.get('/times', (req, res) => {
		const values = { a: 1 };
		res.json(values);
	});
	app.post('/times', (req, res) => {
		logger.info('server received:', req.body);
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
};
