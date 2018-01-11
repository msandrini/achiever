/* global window */
import moment from 'moment';

import strings from '../../../shared/strings';

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
};

/**
 *
 * @param {Object} stateStoredTimes
 * @param {Function} addTimeEntry
 */
export const submitToServer = async (stateStoredTimes, addTimeEntry) => {
	const startTime = stateStoredTimes[storedTimesIndex.startTime];
	const startBreakTime = stateStoredTimes[storedTimesIndex.startBreakTime];
	const endBreakTime = stateStoredTimes[storedTimesIndex.endBreakTime];
	const endTime = stateStoredTimes[storedTimesIndex.endTime];

	const timeEntryInput = {
		date: moment().format('YYYY-MM-DD'),
		startTime: `${startTime.hours}:${startTime.minutes}`,
		startBreakTime: `${startBreakTime.hours}:${startBreakTime.minutes}`,
		endBreakTime: `${endBreakTime.hours}:${endBreakTime.minutes}`,
		endTime: `${endTime.hours}:${endTime.minutes}`
	};

	return _addTimeEntry(timeEntryInput, addTimeEntry);
};
