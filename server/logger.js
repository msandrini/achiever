const { createLogger, format, transports } = require('winston');

const {
	combine, timestamp, printf, splat
} = format;

const logger = createLogger({
	level: 'info',
	format: combine(
		timestamp(),
		splat(),
		printf(log => `${log.timestamp} [${log.level.toUpperCase()}]: ${log.message}`)
	),
	transports: [
		new transports.File({ filename: 'error.log', level: 'error' }),
		new transports.File({ filename: 'console.log' })
	]
});

if (process.env.NODE_ENV !== 'production') {
	logger.add(new transports.Console({
		format: combine(
			splat(),
			printf(log => log.message)
		)
	}));
}

module.exports = logger;
