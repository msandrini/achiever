const { createLogger, format, transports } = require('winston');

const { combine, timestamp, printf } = format;

const logger = createLogger({
	level: 'info',
	format: combine(
		timestamp(),
		printf(info => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`)
	),
	transports: [
		new transports.File({ filename: 'error.log', level: 'error' }),
		new transports.File({ filename: 'console.log' })
	]
});

if (process.env.NODE_ENV !== 'production') {
	logger.add(new transports.Console({
		format: printf(info => info.message)
	}));
}

module.exports = logger;
