const storage = require('node-persist');
const chalk = require('chalk');
const logger = require('../logger');

const { apiCalls } = require('../../shared/utils');
const strings = require('../../shared/strings');

const STORAGE_KEY = 'storedTimes';
storage.initSync({ dir: 'server/temp' });

const _getDateObj = value => (typeof value !== 'object' ?
	new Date(value) : value);

const _getSuccintTime = dateObj => ({
	minutes: _getDateObj(dateObj).getMinutes(),
	hours: _getDateObj(dateObj).getHours()
});

const _minutesWithZero = minutes => (minutes < 10 ? `0${minutes}` : minutes);

const _getDisplayTime = (dateObj) => {
	const hours = _getDateObj(dateObj).getHours();
	const minutes = _getDateObj(dateObj).getMinutes();
	return `${hours}:${_minutesWithZero(minutes)}`;
};

const _onCallError = (e) => {
	logger.error(chalk.red(strings.sendCallFeedbacks.error), e);
};

const _onCallSuccess = (timesObj, timesNumber) => {
	logger.info(chalk`{bgGreen.white \n${strings.sendCallFeedbacks.success}\n}`);

	strings.times.forEach((labelObj, index) => {
		const displayMinutes = _minutesWithZero(timesObj[index].minutes);
		const displayTime = `${timesObj[index].hours}:${displayMinutes}`;
		logger.info(`${labelObj.label}: ${displayTime}`);
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

const clearTimes = () => {
	storage.setItemSync(STORAGE_KEY, []);
};

const sendTimesAndClearStore = (times) => {
	const date = new Date(times[0]);
	// TODO: check if days are the same in time[0] and time[1...3]
	const valuesToSend = {
		times: times.map(_getSuccintTime),
		date: {
			day: date.getDate(),
			month: date.getMonth(),
			year: date.getFullYear()
		}
	};

	// send stored values to the backend when they are 4
	apiCalls.sendTimes(valuesToSend).then(() =>
		_onCallSuccess(valuesToSend.times, times)).catch(_onCallError);

	// and clear the store
	clearTimes();
};

const updateTime = (index, timeToInsert = new Date(), timeIdString = strings.thisTime) => {
	const storedTimes = storage.getItemSync(STORAGE_KEY) || [];
	console.log(storage.values())
	const indexToInsert = index || storedTimes.length;
	storedTimes[indexToInsert] = Number(timeToInsert);
	storage.setItemSync(STORAGE_KEY, storedTimes);

	const timeString = _getDisplayTime(timeToInsert);
	const message = `${timeIdString} ${strings.storedSuccessfully}`;
	const messagePlusTime = chalk`${message} {bold (${timeString})}`;
	logger.info(messagePlusTime);

	if (storedTimes.length === 4 && storedTimes.every(Boolean)) {
		sendTimesAndClearStore(storedTimes);
	}
};

const addTime = () => {
	const storedTimes = storage.getItemSync(STORAGE_KEY) || [];

	// in any case, we should display the recorded time
	const lastIndex = storedTimes.length;
	updateTime(lastIndex, new Date(), strings.times[lastIndex].label);
};

const _buildArgumentsWhitelist = () => [
	...strings.clearCliKeywords,
	...strings.multipleCliKeywords,
	...strings.times[0].cliKeywords,
	...strings.times[1].cliKeywords,
	...strings.times[2].cliKeywords,
	...strings.times[3].cliKeywords
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
	addTime,
	updateTime,
	clearTimes,
	locateKeywordsOnArguments,
	listTimesOnArguments
};
