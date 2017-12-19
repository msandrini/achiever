#!/usr/bin/env node
const chalk = require('chalk');
const utils = require('./cli/utils.js');
const sharedUtils = require('../shared/utils.js');
const strings = require('../shared/strings');
const logger = require('./logger');

const {
	confirmAndCall,
	addTime,
	updateTime,
	clearTimes,
	locateKeywordsOnArguments,
	listTimesOnArguments,
	debug
} = utils;

const { buildDateFromTimeString } = sharedUtils;

// debug mode
if (locateKeywordsOnArguments(['debug'])) {
	logger.info(debug());
	process.exit();
}

let fellIntoAnyCase = false;

// clear temporary times
if (locateKeywordsOnArguments(strings.clearCliKeywords)) {
	confirmAndCall(`${strings.clearConfirm}`, clearTimes);
	fellIntoAnyCase = true;
}

// set specific time
strings.times.forEach((stringObj, index) => {
	if (locateKeywordsOnArguments(stringObj.cliKeywords)) {
		const times = listTimesOnArguments();
		if (times[0]) {
			const timeToInsert = buildDateFromTimeString(times[0]);
			updateTime(index, timeToInsert, stringObj.label);
			fellIntoAnyCase = true;
		} else {
			logger.error(chalk.red(strings.noTimesProvided));
		}
		if (times.length > 1) {
			logger.warn(strings.otherTimesIgnored);
		}
	}
});

// default (set next time)
if (!fellIntoAnyCase) {
	addTime();
}
