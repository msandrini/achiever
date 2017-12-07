#!/usr/bin/env node
const chalk = require('chalk');
const utils = require('./cli/utils.js');
const sharedUtils = require('../shared/utils.js');
const strings = require('../shared/strings');
const logger = require('./logger');

const {
	addTime,
	updateTime,
	clearTimes,
	locateKeywordsOnArguments,
	listTimesOnArguments
} = utils;

const { buildDateFromTimeString } = sharedUtils;

// clear temporary times
if (locateKeywordsOnArguments(strings.clearCliKeywords)) {
	clearTimes();
	logger.info(strings.timesFlushed);
	process.exit();
}

// set specific time
strings.times.forEach((stringObj, index) => {
	if (locateKeywordsOnArguments(stringObj.cliKeywords)) {
		const times = listTimesOnArguments();
		if (times[0]) {
			clearTimes();
			const timeToInsert = buildDateFromTimeString(times[0]);
			updateTime(index, timeToInsert, stringObj.label);
		} else {
			logger.error(chalk.red(strings.noTimesProvided));
		}
		if (times.length > 1) {
			logger.warn(strings.otherTimesIgnored);
		}
		process.exit();
	}
});

// set multiple times
if (locateKeywordsOnArguments(strings.multipleCliKeywords)) {
	const times = listTimesOnArguments();
	if (times.length) {
		clearTimes();
		times.forEach((time, index) => {
			const timeToInsert = buildDateFromTimeString(time);
			updateTime(index, timeToInsert, strings.times[index].label);
		});
	} else {
		logger.error(chalk.red(strings.noTimesProvided));
	}
	process.exit();
}

// default (set next time)
addTime();
