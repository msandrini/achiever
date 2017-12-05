#!/usr/bin/env node

const Storage = require('node-storage');
const path = require('path');
const chalk = require('chalk');
const logger = require('./logger');

const tempFilePath = path.resolve(__dirname, './tempStorage');
const { apiCalls } = require('../shared/utils');
const strings = require('./strings');

const STORAGE_KEY = 'storedTimes';
const store = new Storage(tempFilePath);

const getDateObj = value => (typeof value !== 'object' ?
	new Date(value) : value);

const getSuccintTime = dateObj => ({
	minutes: getDateObj(dateObj).getMinutes(),
	hours: getDateObj(dateObj).getHours()
});

const minutesWithZero = minutes => (minutes < 10 ? `0${minutes}` : minutes);

const getDisplayTime = (dateObj) => {
	const hours = getDateObj(dateObj).getHours();
	const minutes = getDateObj(dateObj).getMinutes();
	return `${hours}:${minutesWithZero(minutes)}`;
};

const onCallError = (e) => {
	logger.error(chalk.red(strings.errorOnSendCall), e);
};

const onCallSuccess = (timesObj, timesNumber) => {
	logger.info(chalk`{bgGreen.white \n${strings.successOnSendCall}\n}`);

	strings.times.forEach((label, index) => {
		const displayMinutes = minutesWithZero(timesObj[index].minutes);
		const displayTime = `${timesObj[index].hours}:${displayMinutes}`;
		logger.info(`${label}: ${displayTime}`);
	});
	const labouredRaw = [
		timesNumber[1] - timesNumber[0],
		timesNumber[3] - timesNumber[2]
	];

	const labouredHours = labouredRaw.map(time =>
		Math.floor((((time / 1000) / 60) / 60) * 100) / 100);

	logger.info(chalk`\n${strings.hoursLaboured}
        ${strings.morningPeriod}: {bold ${labouredHours[0]}}
        ${strings.afternoonPeriod}: {bold ${labouredHours[1]}}
        {yellow ${strings.total}: {bold ${labouredHours[0] + labouredHours[1]}}}`);
};

const now = new Date();

// we should first see if the user has stored times
const storedTimes = store.get(STORAGE_KEY);

if (storedTimes && storedTimes.length) {
	const valuesPlusNow = [...storedTimes, Number(now)];

	store.put(STORAGE_KEY, valuesPlusNow);

	// if the user has them, we should assess how many
	if (valuesPlusNow.length === 4) {
		const valuesToSend = {
			times: valuesPlusNow.map(getSuccintTime),
			date: {
				day: now.getDate(),
				month: now.getMonth(),
				year: now.getFullYear()
			}
		};

		// and send them to the backend when they are 4
		apiCalls.sendTimes(valuesToSend).then(() =>
			onCallSuccess(valuesToSend.times, valuesPlusNow)).catch(onCallError);

		// and clear the store
		store.remove(STORAGE_KEY);
	}

	// in any case, we should display the recorded time
	const lastIndex = storedTimes.length;
	const timeString = getDisplayTime(valuesPlusNow[lastIndex]);
	const message = `${strings.times[lastIndex]} ${strings.storedSuccessfully}`;
	const messagePlusTime = chalk`${message} {bold (${timeString})}`;
	logger.info(messagePlusTime);
} else {
	// if the user doesn't have times, we should record the arrival
	store.put(STORAGE_KEY, [Number(now)]);
	const message = `${strings.times[0]} ${strings.storedSuccessfully}`;
	const messagePlusTime = chalk`${message} {bold (${getDisplayTime(now)})}`;
	logger.info(messagePlusTime);
}
