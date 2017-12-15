const http = require('http');
const mockserver = require('mockserver');
const logger = require('./logger');

http.createServer(mockserver(`${__dirname}/dummyServerMocks`)).listen(9001);
logger.info('Serving dummyServer on 9001!');
