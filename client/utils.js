/* global window */
import moment from 'moment';
import TimeDuration from 'time-duration';

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
export const SPECIAL_ACTIVITY_HOLIDAY = { id: 99999, name: 'Holiday' };

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
 * @param {[]} array to be replaced
 * @param {*} index of the element to be replaced
 * @param {*} newValue new value ot array[index]
 */
export const replacingValueInsideArray = (array, index, newValue) => [
	...array.slice(0, index),
	newValue,
	...array.slice(index + 1)
];

const _setStorage = (key, data) => {
	global.localStorage.setItem(key, JSON.stringify(data));
};

/**
 * This function set at storage {key, value} {dayKey: today's date}
 * @param {*} key to be used as a index key for data
 * @param {*} dayKey to be used as index key for the day
 * @param {*} data to be save as {key, data}
 */
export const setTodayStorage = (data, key = STORAGEKEY, dayKey = STORAGEDAYKEY) => {
	const today = moment();
	_setStorage(dayKey, today.valueOf());
	_setStorage(key, data);
};

const _getStorage = key => (
	JSON.parse(global.localStorage.getItem(key))
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
	if (global.localStorage.getItem(dayKey)) {
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

/**
 * Given and array of times *(entry, lunch_out, lunch_in, exit), calculate the total laboured hours
 * @param {Object[]} storedTimes is an array of obj {hours, minutes}
 * @return {string} the total duration as HH:mm
 */
export const calculateLabouredHours = (storedTimes) => {
	const startTime = storedTimes[storedTimesIndex.startTime];
	const startBreakTime = storedTimes[storedTimesIndex.startBreakTime];
	const endBreakTime = storedTimes[storedTimesIndex.endBreakTime];
	const endTime = storedTimes[storedTimesIndex.endTime];

	const labouredHoursOnDay = new TimeDuration();
	labouredHoursOnDay.add(endTime);
	labouredHoursOnDay.subtract(endBreakTime);
	labouredHoursOnDay.add(startBreakTime);
	labouredHoursOnDay.subtract(startTime);

	return labouredHoursOnDay.toString();
};

const getContractedHoursUpToDate = (contractedHours, businessDaysUpToDate) =>
	new TimeDuration(contractedHours).multiplyBy(businessDaysUpToDate);

const getLabouredHoursUpToDate = (controlDate, timeEntries, labouredHoursOnDay = false) => {
	const timeEntriesUpToDate = timeEntries
		.filter(dayEntry => moment(dayEntry.date).isSameOrBefore(controlDate, 'day'));
	const minutesUpToDateWithActiveDay = timeEntriesUpToDate
		.map((dayEntry) => {
			const hasActiveDay = moment(dayEntry.date).isSame(controlDate, 'day') &&
				labouredHoursOnDay;
			return new TimeDuration(hasActiveDay ?
				labouredHoursOnDay : dayEntry.total).toMinutes();
		});

	const minutesLabouredUpToDate = minutesUpToDateWithActiveDay
		.reduce((totalUpToNow, dayTotal) => totalUpToNow + dayTotal, 0);

	return new TimeDuration(minutesLabouredUpToDate);
};

export const calculateHoursBalanceUpToDate = (controlDate, params) => {
	const {
		labouredHoursOnDay,
		contractedHoursForADay,
		timeEntries
	} = params;

	const businessDaysUpToDate = controlDate.day() > 5 ? 5 : controlDate.day();

	const contractedHoursUpToDate = getContractedHoursUpToDate(
		contractedHoursForADay,
		businessDaysUpToDate
	);

	const labouredHoursUpToDate = getLabouredHoursUpToDate(
		controlDate,
		timeEntries,
		labouredHoursOnDay
	);

	return {
		contractedHoursUpToDate,
		labouredHoursUpToDate
	};
};

/**
 * Given and array of times, check if it's completed and if hours are increasing
 * @param {Object[]} times is an array of obj {hours, minutes}
 * @return {bool} if it is a valid array
 */
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

export const isDayBlockedInPast = (day) => {
	const today = moment();
	if (day.isSameOrAfter(today, 'day')) {
		return false;
	}
	const MONDAY = 1;
	const todayIsMonday = today.day() === MONDAY;
	// if it is monday then last week is still valid
	if (todayIsMonday) {
		const lastFriday = today.subtract(3, 'days');
		return day.isBefore(lastFriday, 'week');
	}
	return day.isBefore(today, 'week');
};

export const isDayAfterToday = day => day.isAfter(moment(), 'day');
