const { graphiqlExpress } = require('apollo-server-express');
const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const api = require('./api');
const { tokenFactory } = require('./api/utils');
const logger = require('./logger');

const getFromRoot = file => path.resolve(__dirname, `../${file}`);

const serveGzipped = contentType => (req, res) => {
	const acceptedEncodings = req.acceptsEncodings();
	if (acceptedEncodings.indexOf('gzip') !== -1
		&& fs.existsSync(getFromRoot(`client/dist/${req.url}.gz`))) {
		req.url = `${req.url}.gz`;
		res.set('Content-Encoding', 'gzip');
		res.set('Content-Type', contentType);
	}

	res.sendFile(getFromRoot(`client/dist/${req.url}`));
};

module.exports = (app, compiler) => {
	app.use('/graphql', bodyParser.json(), api);
	app.use('/graphiql', graphiqlExpress({
		endpointURL: '/graphql',
		passHeader: `'Authorization': 'Bearer ${tokenFactory()}'`
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
	const isDevelopment = process.env.NODE_ENV !== 'production';
	const pageWhitelist = ['', 'edit', 'today', 'login', 'advanced'];
	const htmlFile = getFromRoot('client/dist/index.html');
	if (!isDevelopment) {
		app.use('/assets', express.static(getFromRoot('client/assets')));
		pageWhitelist.forEach((page) => {
			app.get(`/${page}`, (req, res) => {
				res.sendFile(htmlFile);
			});
		});
		app.get('/*.js', serveGzipped('text/javascript'));
	} else {
		pageWhitelist.forEach((page) => {
			app.get(`/${page}`, (req, res, next) => {
				compiler.outputFileSystem.readFile(htmlFile, (err, result) => {
					if (err) {
						return next(err);
					}
					res.set('content-type', 'text/html');
					res.sendFile(result);
					res.end();
					return next();
				});
			});
		});
	}
};
