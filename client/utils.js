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
	const {
		startTime,
		breakStartTime,
		breakEndTime,
		endTime
	} = stateStoredTimes;

	const timeEntryInput = {
		date: date.format('YYYY-MM-DD'),
		phaseId: phase.id,
		activityId: activity.id,
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

export const dismemberTimeString = (timeString) => {
	const [rawHours, rawMinutes] = String(timeString).split(':');
	let hours;
	let minutes;

	if (rawHours && rawMinutes) {
		hours = Number.isNaN(Number(rawHours)) ? null : Number(rawHours);
		minutes = Number.isNaN(Number(rawMinutes)) ? null : Number(rawMinutes);
	} else {
		hours = null;
		minutes = null;
	}
	return { hours, minutes };
};

/**
 * Given and array of times, check if it's completed and if hours are increasing
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
		const sequence = []
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

export const allTimesAreFilled = (times) => {
	const startTime = times.startTime &&
		times.startTime.hours &&
		times.startTime.minutes;
	const breakStartTime = times.breakStartTime &&
		times.breakStartTime.hours &&
		times.breakStartTime.minutes;
	const breakEndTime = times.breakEndTime &&
		times.breakEndTime.hours &&
		times.breakEndTime.minutes;
	const endTime = times.endTime &&
		times.endTime.hours &&
		times.endTime.minutes;
	return Boolean(startTime && endTime &&
		(
			(breakStartTime && breakEndTime) ||
			(!breakStartTime && !breakEndTime)
		));
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

export const getTimeEntriesForWeek = async (choosenDay) => {
	const momentChoosenDay = { ...choosenDay };
	const firstDay = moment(momentChoosenDay).day(0);
	const db = await DB('entries', 'date');
	const promisses = [];

	for (const weekDayIterator of [0, 1, 2, 3, 4, 5, 6]) {
		promisses.push(indexedDBToTimeEntry(db, firstDay.day(weekDayIterator).format('YYYY-MM-DD')));
	}

	const timeEntries = await Promise.all(promisses);
	return timeEntries;
};

export const isControlDatePersisted = async (controlDate) => {
	try {
		const db = await DB('entries', 'date');
		const entry = await db.getEntry(controlDate.format('YYYY-MM-DD'));
		if (areTheSameDay(controlDate, moment())) {
			return Boolean(entry && entry.sentToday);
		}
		return Boolean(entry && entry.contractedTime);
	} catch (e) {
		console.error(e);
		return false;
	}
};
