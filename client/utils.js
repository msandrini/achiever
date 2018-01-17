/* global window */
import moment from 'moment';

import strings from '../shared/strings';
import { timeIsValid } from '../shared/utils';

moment.locale('pt-br');

export const STORAGEKEY = 'storedTimes';
export const STORAGEDAYKEY = 'storedMoment';
export const storedTimesIndex = {
	startTime: 0,
	startBreakTime: 1,
	endBreakTime: 2,
	endTime: 3
};

/**
 * Check if the date1 === date2 based on day
 * @param {Date} date1
 * @param {Date} date2
 */
export const areTheSameDay = (date1, date2) => (
	date1.day() === date2.day() &&
	date1.month() === date2.month() &&
	date1.year() === date2.year()
);

/**
 * Replace the value of array[index] to be newValue
 * @param {Array} array to be replaced
 * @param {*} index of the element to be replaced
 * @param {*} newValue new value ot array[index]
 */
export const replacingValueInsideArray = (array, index, newValue) => [
	...array.slice(0, index),
	newValue,
	...array.slice(index + 1)
];

const _setStorage = (key, data) => {
	window.localStorage.setItem(key, JSON.stringify(data));
};

/**
 * This function set at storage {key, value} {dayKey: today's date}
 * @param {*} key to be used as a index key for data
 * @param {*} dayKey to be used as index key for the day
 * @param {*} data to be save as {key, data}
 */
export const setTodayStorage = (data, key = STORAGEKEY, dayKey = STORAGEDAYKEY) => {
	const today = moment();
	_setStorage(dayKey, today);
	_setStorage(key, data);
};

const _getStorage = key => (
	JSON.parse(window.localStorage.getItem(key))
);

/**
 * Get from storage {key, data} and {dayKey, dayOnLocalStorage}. If today's date is different from
 * LocalStorage it will delete it all
 * @param {*} key is the key to be used to get {key, data}
 * @param {*} dayKey is the key to be used to get {dayKey, dayOnLocalStorage}
 */
export const getTodayStorage = (key = STORAGEKEY, dayKey = STORAGEDAYKEY) => {
	const dayOnLocal = moment(_getStorage(dayKey));
	const today = moment();
	if (dayKey in window.localStorage) {
		if (areTheSameDay(dayOnLocal, today)) {
			return _getStorage(key);
		}
	}
	setTodayStorage({ storedTimes: [{}, {}, {}, {}], sentToday: false }, key, dayKey);
	return { storedTimes: [{}, {}, {}, {}], sentToday: false };
};

/**
 * Remove from localStorage key, dayKey
 * @param {*} key
 * @param {*} dayKey
 */
export const clearTodayStorage = (key = STORAGEKEY, dayKey = STORAGEDAYKEY) => {
	localStorage.removeItem(key);
	localStorage.removeItem(dayKey);
};

/**
 *
 * @param {Object} timeEntryInput
 * @param {Function} addTimeEntry
 */
const _addTimeEntry = async (timeEntryInput, addTimeEntry) => {
	let response;
	try {
		response = await addTimeEntry({
			variables: {
				timeEntry: timeEntryInput
			}
		});
	} catch (error) {
		return { errorMessage: error.graphQLErrors[0].message };
	}

	if (response) {
		return { successMessage: strings.submitTimeSuccess };
	}

	return { successMessage: '' };
};

/**
 *
 * @param {Date} date
 * @param {Object} stateStoredTimes
 * @param {Function} addTimeEntry
 */
export const submitToServer = async (date, stateStoredTimes, phase, activity, addTimeEntry) => {
	const startTime = stateStoredTimes[storedTimesIndex.startTime];
	const startBreakTime = stateStoredTimes[storedTimesIndex.startBreakTime];
	const endBreakTime = stateStoredTimes[storedTimesIndex.endBreakTime];
	const endTime = stateStoredTimes[storedTimesIndex.endTime];

	const timeEntryInput = {
		date: date.format('YYYY-MM-DD'),
		phaseId: phase.id,
		activityId: activity.id,
		startTime: `${startTime.hours}:${startTime.minutes}`,
		startBreakTime: `${startBreakTime.hours}:${startBreakTime.minutes}`,
		endBreakTime: `${endBreakTime.hours}:${endBreakTime.minutes}`,
		endTime: `${endTime.hours}:${endTime.minutes}`
	};

	return _addTimeEntry(timeEntryInput, addTimeEntry);
};

export const calculateLabouredHours = (storedTimes) => {
	const startTime = storedTimes[storedTimesIndex.startTime];
	const startBreakTime = storedTimes[storedTimesIndex.startBreakTime];
	const endBreakTime = storedTimes[storedTimesIndex.endBreakTime];
	const endTime = storedTimes[storedTimesIndex.endTime];

	const labouredHoursOnDay = moment().startOf('day');
	labouredHoursOnDay.add({
		hours: endTime.hours,
		minutes: endTime.minutes
	});
	labouredHoursOnDay.subtract({
		hours: startTime.hours,
		minutes: startTime.minutes
	});
	labouredHoursOnDay.add({
		hours: startBreakTime.hours,
		minutes: startBreakTime.minutes
	});
	labouredHoursOnDay.subtract({
		hours: endBreakTime.hours,
		minutes: endBreakTime.minutes
	});

	return labouredHoursOnDay.format('H:mm');
};

export const stringifyTime = (hours, minutes) => {
	let timeAsString = '';
	let hoursAsString = hours;
	let minutesAsString = minutes;
	let balanceSign;

	if (hours > 0 || minutes > 0) {
		balanceSign = '-';
	} else if (hours < 0 || minutes < 0) {
		balanceSign = '+';
	} else {
		balanceSign = '';
	}

	if (hours < 0) {
		hoursAsString *= -1;
	}

	if (minutes < 0) {
		minutesAsString *= -1;
	}

	if (minutesAsString < 10) {
		minutesAsString = `0${minutesAsString}`;
	}

	timeAsString += `${balanceSign}${hoursAsString}:${minutesAsString}`;

	return timeAsString;
};

export const calculateRemainingHoursOnWeek = (date, workedTime, contractedHours, totalWeek) => {
	const businessDay = date.day() > 5 ? 5 : date.day();

	const dailyContractedDuration = moment.duration(contractedHours);

	const expectedDuration = moment.duration().add({
		hours: dailyContractedDuration.hours() * businessDay,
		minutes: dailyContractedDuration.minutes() * businessDay
	});

	expectedDuration.subtract({
		hours: totalWeek.split(':')[0],
		minutes: totalWeek.split(':')[1]
	});

	const labouredHoursDuration = moment.duration(workedTime);
	expectedDuration.subtract({
		hours: labouredHoursDuration.hours(),
		minutes: labouredHoursDuration.minutes()
	});

	const totalHours = (expectedDuration.days() * 24) + expectedDuration.hours();
	const totalMinutes = expectedDuration.minutes();

	return {
		remainingTime: stringifyTime(totalHours, totalMinutes),
		entitledDuration: expectedDuration,
		labouredDuration: labouredHoursDuration
	};
};

export const timesAreValid = (times) => {
	let comparisonTerm = 0;
	const isSequentialTime = (time) => {
		if (time && timeIsValid(time)) {
			const date = new Date(2017, 0, 1, time.hours, time.minutes, 0, 0);
			const isLaterThanComparison = date > comparisonTerm;
			comparisonTerm = Number(date);
			return isLaterThanComparison;
		}
		return false;
	};

	return times.every(isSequentialTime);
};

export const dismemberTimeString = (timeString) => {
	const [hours, minutesRaw] = String(timeString).split(':');
	const minutes = (parseInt(minutesRaw < 10, 10)) ? `0${minutesRaw}` : minutesRaw;
	return { hours, minutes };
};
