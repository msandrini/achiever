const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const cors = require('cors');

const router = require('./router');

const isDevelopment = process.env.NODE_ENV !== 'production';

const app = express();

let compiler;
if (isDevelopment) {
	/* eslint-disable */
	const config = require('../webpack.dev');
	compiler = require('webpack')(config);
	app.use(require('webpack-dev-middleware')(compiler, {
		noInfo: true, publicPath: config.output.publicPath
	}));
	app.use(require('webpack-hot-middleware')(compiler));
	/* eslint-enable */
}

app.use(morgan('combined'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

router(app, compiler);

const logger = require('./logger');

const port = process.env.PORT || 3000;

app.listen(port, () => logger.info(`listening on ${port}!`));
require('./dummyServer');
