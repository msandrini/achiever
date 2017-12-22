/* global window */
import moment from 'moment';

moment.locale('pt-br');

export const STORAGEKEY = 'storedTimes';
export const STORAGEDAYKEY = 'storedMoment';
export const storedTimesIndex = {
	startTime: 0,
	startBreakTime: 1,
	endBreakTime: 2,
	endTime: 3
};

export const areTheSameDay = (date1, date2) => (
	date1.day() === date2.day() &&
	date1.month() === date2.month() &&
	date1.year() === date2.year()
);

export const replacingValueInsideArray = (array, index, newValue) => [
	...array.slice(0, index),
	newValue,
	...array.slice(index + 1)
];

const _setStorage = (key, data) => {
	window.localStorage.setItem(key, JSON.stringify(data));
};

export const setTodayStorage = (key, dayKey, data) => {
	const today = moment();
	_setStorage(dayKey, today);
	_setStorage(key, data);
};

const _getStorage = key => (
	JSON.parse(window.localStorage.getItem(key))
);

export const getTodayStorage = (key, dayKey) => {
	const dayOnLocal = moment(_getStorage(dayKey));
	const today = moment();
	if (dayKey in window.localStorage) {
		if (areTheSameDay(dayOnLocal, today)) {
			return _getStorage(key);
		}
	}
	setTodayStorage(key, dayKey, { storedTimes: [{}, {}, {}, {}], sentToday: false });
	return { storedTimes: [{}, {}, {}, {}], sentToday: false };
};

const _addTimeEntry = async (timeEntryInput, addTimeEntry) => {
	let response;
	try {
		response = await addTimeEntry({
			variables: {
				timeEntry: timeEntryInput
			}
		});
	} catch (error) {
		console.error('Time entry failed!', error);
	}

	if (response) {
		console.info('Time entry saved!!!');
	}
};

export const submitToServer = (state, addTimeEntry) => {
	const { storedTimes } = state;

	const startTime = storedTimes[storedTimesIndex.startTime];
	const startBreakTime = storedTimes[storedTimesIndex.startBreakTime];
	const endBreakTime = storedTimes[storedTimesIndex.endBreakTime];
	const endTime = storedTimes[storedTimesIndex.endTime];

	const timeEntryInput = {
		date: moment().format('YYYY-MM-DD'),
		startTime: `${startTime.hours}:${startTime.minutes}`,
		startBreakTime: `${startBreakTime.hours}:${startBreakTime.minutes}`,
		endBreakTime: `${endBreakTime.hours}:${endBreakTime.minutes}`,
		endTime: `${endTime.hours}:${endTime.minutes}`
	};

	_addTimeEntry(timeEntryInput, addTimeEntry);
};
