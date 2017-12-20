const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const router = require('./router');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

app.use(morgan('combined'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

router(app);

const logger = require('./logger');

app.listen(3000, () => logger.info('listening on 3000!'));
require('./dummyServer');
