/* global window */
import moment from 'moment-timezone';
import TimeDuration from 'time-duration';
import DB from 'minimal-indexed-db';

import strings from '../shared/strings';
import { timeIsValid } from '../shared/utils';

moment.locale('pt-br');
moment.tz.setDefault('America/Sao_Paulo');

export const STORAGEKEY = 'storedTimes';
export const STORAGEDAYKEY = 'storedMoment';
export const storedTimesIndex = {
	startTime: 0,
	breakStartTime: 1,
	breakEndTime: 2,
	endTime: 3
};
export const SPECIAL_ACTIVITY_HOLIDAY = { id: 99999, name: 'Holiday' };

/**
 * Check if the date1 === date2 based on day
 * @param {Date} date1
 * @param {Date} date2
 */
export const areTheSameDay = (date1, date2) => (
	date1.format('YYYY-MM-DD') === date2.format('YYYY-MM-DD')
);

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
	return null;
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
 * A storedValue is empty if null or 0
 * @param {*} key is a value
 */
export const isEmptyStoredValue = key => ((key === null) || (typeof key === 'undefined'));

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
export const submitToServer = async (
	date,
	stateStoredTimes,
	addTimeEntry,
	phase = null,
	activity = null
) => {
	const {
		startTime,
		breakStartTime,
		breakEndTime,
		endTime
	} = stateStoredTimes;

	const timeEntryInput = {
		date: date.format('YYYY-MM-DD'),
		phaseId: phase && phase.id,
		activityId: activity && activity.id,
		startTime: `${startTime.hours}:${startTime.minutes}`,
		breakStartTime: `${breakStartTime.hours}:${breakStartTime.minutes}`,
		breakEndTime: `${breakEndTime.hours}:${breakEndTime.minutes}`,
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
	const {
		startTime,
		breakStartTime,
		breakEndTime,
		endTime
	} = storedTimes;

	const labouredHoursOnDay = new TimeDuration();
	labouredHoursOnDay.add(endTime);
	labouredHoursOnDay.subtract(breakEndTime);
	labouredHoursOnDay.add(breakStartTime);
	labouredHoursOnDay.subtract(startTime);

	if (labouredHoursOnDay.valueOf() < 0) {
		return '00:00';
	}
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

/**
 * Calculate how many hours the user should have worked and how many it worked until controlDate
 * params:
 *  - labouredHoursOnDay: String 'HH:MM' of how many hours the user worked on controlDate
 *  - contractedHoursForADay: String 'HH:MM' how many hours the user should work on a day
 *  - timeEntries: An array of timeEntry of the selected week (check getTimeEntriesForWeek)
 * @param {Object} controlDate - moment object
 * @param {Object} params - { labouredHoursOnDay, contractedHoursForADay, timeEntries}
 * @returns {Object} - { contractedHoursUpToDate, labouredHoursUpToDate }
 */
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
 * Given an string of HH:MM returns an object of it
 * @param {string} timeString - "HH:MM"
 * @returns {Object} {hours: Number(HH), minutes: (MM)}
 */
export const dismemberTimeString = (timeString) => {
	const validStringTime = rawTime => (Number.isNaN(Number(rawTime)) ? null : Number(rawTime));

	const [rawHours, rawMinutes] = String(timeString).split(':');
	const minutes = validStringTime(rawMinutes);
	const hours = minutes === null ? null : validStringTime(rawHours);
	return { hours, minutes };
};

/**
 * Given and array of times, check if if hours are increasing and are a valid time for the app:
 *  - All but lunch times
 *  - All are complete
 * @param {Object[]} times is an obj of startTime, breakStartTime, breakEndTime, endTime
 * @return {bool} if it is a valid array
 */
export const timesAreValid = (times) => {
	const isSequential = (usedFields) => {
		let comparisonTerm = 0;
		const isSequentialTime = (timeName) => {
			const time = times[timeName];
			if (time && timeIsValid(time)) {
				const date = new Date(2017, 0, 1, time.hours, time.minutes, 0, 0);
				const isLaterThanComparison = date > comparisonTerm;
				comparisonTerm = Number(date);
				return isLaterThanComparison;
			}
			return false;
		};

		return usedFields.every(isSequentialTime);
	};

	if (times) {
		const sequence = [];
		if (times.startTime && times.startTime.hours && times.startTime.minutes) {
			sequence.push('startTime');
		}
		if (times.breakStartTime && times.breakStartTime.hours && times.breakStartTime.minutes) {
			sequence.push('breakStartTime');
		}
		if (times.breakEndTime && times.breakEndTime.hours && times.breakEndTime.minutes) {
			sequence.push('breakEndTime');
		}
		if (times.endTime && times.endTime.hours && times.endTime.minutes) {
			sequence.push('endTime');
		}
		return isSequential(sequence);
	}
	return false;
};

/**
 * Check if all the fields of times are complete
 * @param {Object} times - {startTime:{}, breakStartTime: {}, breakEndTime:{}, endTime: {}}
 * @returns {Bool}
 */
export const allTimesAreFilled = (times) => {
	const startTime = times.startTime &&
		!isEmptyStoredValue(times.startTime.hours) &&
		!isEmptyStoredValue(times.startTime.minutes);
	const breakStartTime = times.breakStartTime &&
		!isEmptyStoredValue(times.breakStartTime.hours) &&
		!isEmptyStoredValue(times.breakStartTime.minutes);
	const breakEndTime = times.breakEndTime &&
		!isEmptyStoredValue(times.breakEndTime.hours) &&
		!isEmptyStoredValue(times.breakEndTime.minutes);
	const endTime = times.endTime &&
		!isEmptyStoredValue(times.endTime.hours) &&
		!isEmptyStoredValue(times.endTime.minutes);
	return Boolean(startTime && endTime &&
		(
			(breakStartTime && breakEndTime) ||
			(!breakStartTime && !breakEndTime)
		));
};

/**
 * Check if a choosenDay is should appear as blocked following the rule:
 *
 * @param {Object} day - moment object
 */
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

/**
 * Check if a choosen day is after the moment()
 * @param {Object} day - moment object
 * @returns {Bool}
 */
export const isDayAfterToday = day => day.isAfter(moment(), 'day');

/**
 * 
 * @param {IndexedDB} database 
 * @param {*} stringOfDateQuery - "YYYY-MM-DD"
 */
const indexedDBToTimeEntry = async (database, stringOfDateQuery) => {
	const indexedDbQuery = await database.getEntry(stringOfDateQuery);
	const timeEntry = indexedDbQuery ?
		{
			activity: '',		// For the uses now, this doesn't matter
			date: stringOfDateQuery,
			breakEndTime: indexedDbQuery.breakEndTime,
			endTime: indexedDbQuery.endTime,
			phase: '',
			breakStartTime: indexedDbQuery.breakStartTime,
			startTime: indexedDbQuery.startTime,
			total: indexedDbQuery.paidTime
		} :
		{
			activity: '',
			date: stringOfDateQuery,
			breakEndTime: '',
			endTime: '',
			phase: '',
			breakStartTime: '',
			startTime: '',
			total: ''
		};
	return timeEntry;
};

/**
 * Given a day (moment), generates an array containing timeEntry for the week of the select day
 * getting data from indexedDB
 * @param {Object} choosenDay - moment object
 * @param {IndexedDB} openendDB - a indexedDB afeter opened
 */
export const getTimeEntriesForWeek = async (choosenDay, openendDB = null) => {
	let db;
	if (openendDB) {
		db = openendDB;
	} else {
		db = await DB('entries', 'date');
	}
	const momentChoosenDay = { ...choosenDay };
	const firstDay = moment(momentChoosenDay).day(0);
	const promisses = [];

	for (const weekDayIterator of [0, 1, 2, 3, 4, 5, 6]) {
		promisses.push(indexedDBToTimeEntry(db, firstDay.day(weekDayIterator).format('YYYY-MM-DD')));
	}

	const timeEntries = await Promise.all(promisses);
	return timeEntries;
};

/**
 * check if the choosen day (controDate) is on indexedDB
 * @param {Object} controlDate - a moment object
 */
export const isControlDatePersisted = async (controlDate) => {
	try {
		const db = await DB('entries', 'date');
		const entry = await db.getEntry(controlDate.format('YYYY-MM-DD'));
		if (areTheSameDay(controlDate, moment())) {
			return Boolean(entry && entry.persisted);
		}
		return Boolean(entry && entry.contractedTime);
	} catch (e) {
		console.error(e);
		return false;
	}
};


/**
 * Insert on indexedDB the desired query data
 * @param {String} query - query type: allEntries or dayEntry
 * @param {*} allEntries - for allEntriesQuery->allEntries and dayEntryQuery->dayEntry
 */
export const propagateQuery = async (query, data) => {
	if (query === 'allEntries') {
		const timeData = [];
		data.timeData.forEach((timeEntry) => {
			timeData.push({
				...timeEntry,
				startTime: dismemberTimeString(timeEntry.startTime),
				breakStartTime: dismemberTimeString(timeEntry.breakStartTime),
				breakEndTime: dismemberTimeString(timeEntry.breakEndTime),
				endTime: dismemberTimeString(timeEntry.endTime),
				persisted: true
			});
		});
		// Propagate the date to indexedDB
		const db = await DB('entries', 'date');
		await db.put(timeData);
	} else if (query === 'dayEntry') {
		const db = await DB('entries', 'date');
		await db.put({
			...data,
			persisted: true
		});
	}
};

/**
 * Get the last balance from indexedDB
 * @param {Object} date - moment.js object
 */
export const getLastBalance = async (date) => {
	const lastDay = date.format('ddd') === 'Mon' ?
		date.subtract(1, 'days').startOf('day') :
		moment().day(-6); 		// Last Friday
	const db = await DB('entries', 'date');
	const query = db.getEntry(lastDay.format('YYYY-MM-DD'));
	return query.balanceTime;
};
