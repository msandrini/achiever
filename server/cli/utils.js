const storage = require('node-persist');
const chalk = require('chalk');
const moment = require('moment');
const prompt = require('prompt');

const logger = require('../logger');
const strings = require('../../shared/strings');
const { sendActivity } = require('./calls');

const timeKeys = ['startTime', 'startBreakTime', 'endBreakTime', 'endTime'];

const STORAGE_KEY = 'storedTimes';
storage.initSync({ dir: 'server/temp' });
prompt.start();

const debug = () => storage.values();

/** Private helpers */

const _getDateObj = value => (typeof value !== 'object' ?
	new Date(value) : value);

const _minutesWithZero = minutes => (minutes < 10 ? `0${minutes}` : minutes);

const _getDisplayTime = (dateObj) => {
	const hours = _getDateObj(dateObj).getHours();
	const minutes = _getDateObj(dateObj).getMinutes();
	return `${hours}:${_minutesWithZero(minutes)}`;
};

const _onCallError = (e) => {
	logger.error(chalk.red`${strings.sendCallFeedbacks.error}:${e}`);
};

const _onCallSuccess = (timesObj, timesNumber) => {
	logger.info(chalk`{bgGreen.white \n${strings.sendCallFeedbacks.success}\n}`);

	strings.times.forEach((timeString, index) => {
		logger.info(`${timeString.label}: ${timesObj[timeKeys[index]]}`);
	});

	const labouredRaw = [
		timesNumber[1] - timesNumber[0],
		timesNumber[3] - timesNumber[2]
	];

	const labouredHours = labouredRaw.map(time =>
		Math.floor((((time / 1000) / 60) / 60) * 100) / 100);

	logger.info(chalk`\n${strings.hoursLabouredOnThisDay}
		${strings.morningPeriod}: {bold ${labouredHours[0]}}
		${strings.afternoonPeriod}: {bold ${labouredHours[1]}}
		{yellow ${strings.total}: {bold ${labouredHours[0] + labouredHours[1]}}}`);
};

const _buildArgumentsWhitelist = () => [
	...strings.clearCliKeywords,
	...strings.multipleCliKeywords,
	...strings.times[0].cliKeywords,
	...strings.times[1].cliKeywords,
	...strings.times[2].cliKeywords,
	...strings.times[3].cliKeywords,
	'debug'
];

const _filterArguments = () => {
	const whitelistedArguments = _buildArgumentsWhitelist();
	const rawArguments = process.argv;
	return {
		keywords: rawArguments.filter(argument =>
			whitelistedArguments.includes(argument)),
		times: rawArguments.filter(argument =>
			/[0-9]{1,2}:[0-9]{2}/.test(argument))
	};
};

/** Main functions */

const confirmAndCall = (message, callback) => {
	prompt.message = '🕑';
	prompt.delimiter = ' ';
	prompt.get({
		properties: {
			confirmed: {
				description: chalk.green(message),
				message: strings.cliConfirmationAllowed,
				pattern: /^(s|n|y)$/,
				default: 'n'
			}
		}
	}, (error, result) => {
		if (error) {
			logger.info(strings.cancelled);
		} else if (result.confirmed === 's' || result.confirmed === 'y') {
			callback();
		}
	});
};

const clearTimes = () => {
	storage.setItemSync(STORAGE_KEY, []);
	logger.info(strings.timesFlushed);
	process.exit();
};

const sendTimesAndClearStore = (times) => {
	// TODO: check if days are the same in time[0] and time[1...3]
	const valuesToSend = {
		date: moment(times[0]).format('YYYY-MM-DD')
	};

	times.forEach((time, index) => {
		valuesToSend[timeKeys[index]] = _getDisplayTime(time);
	});

	// send stored values to the backend when they are 4
	sendActivity(valuesToSend)
		.then(_onCallSuccess(valuesToSend, times))
		.catch(_onCallError);

	// and clear the store
	storage.setItemSync(STORAGE_KEY, []);
};

const updateTime = (index, timeToInsert = new Date(), timeIdString = strings.thisTime) => {
	const storedTimes = storage.getItemSync(STORAGE_KEY) || [];

	const valuesMissing = index >= storedTimes.length;

	if (valuesMissing) {
		confirmAndCall(`${strings.markConfirm} ${timeIdString.toLowerCase()}?`, () => {
			storedTimes[index] = Number(timeToInsert);
			storage.setItemSync(STORAGE_KEY, storedTimes);
			const timeString = _getDisplayTime(timeToInsert);

			const message = `${timeIdString} ${strings.storedSuccessfully}`;
			const messagePlusTime = chalk`${message} {bold (${timeString})}`;
			logger.info(messagePlusTime);

			if (storedTimes.length === 4 && storedTimes.every(Boolean)) {
				sendTimesAndClearStore(storedTimes);
			}
		});
	} else {
		logger.error(`${timeIdString}${strings.cannotInsertDisconnectedTime}`);
	}
};

const addTime = () => {
	const storedTimes = storage.getItemSync(STORAGE_KEY) || [];

	// in any case, we should display the recorded time
	const lastIndex = storedTimes.length;
	updateTime(lastIndex, new Date(), strings.times[lastIndex].label);
};

const locateKeywordsOnArguments = (keywords) => {
	const filteredArguments = _filterArguments();
	if (Array.isArray(keywords)) {
		return keywords.some(keyword =>
			filteredArguments.keywords.includes(keyword));
	}
	return false;
};

const listTimesOnArguments = () => {
	const filteredArguments = _filterArguments();
	return filteredArguments.times;
};

module.exports = {
	confirmAndCall,
	debug,
	addTime,
	updateTime,
	clearTimes,
	locateKeywordsOnArguments,
	listTimesOnArguments
};
