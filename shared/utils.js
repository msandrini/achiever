/* global window */
import moment from 'moment';

moment.locale('pt-br');

const STORAGEKEY = 'storedTimes';
const STORAGEDAYKEY = 'storedMoment';

const _isNumber = value => !Number.isNaN(parseInt(value, 10));

const checkValidity = (mode, value) => {
	if (value === null) {
		return true;	// 1st change on TimeGroup, onde will be null
	}
	if (_isNumber(value)) {
		const max = mode === 'hours' ? 24 : 60;
		return max > value && value >= 0;
	}
	return false;
};

const timeIsValid = time => checkValidity('minutes', time.minutes) &&
	checkValidity('hours', time.hours);

const getTimeFromDate = (rawDate) => {
	const date = (typeof rawDate === 'number') ? new Date(rawDate) : rawDate;
	return {
		hours: date.getHours(),
		minutes: date.getMinutes()
	};
};

const buildDateFromTimeString = (timeString) => {
	const [hours, minutes] = timeString.split(':');
	const year = new Date().getFullYear();
	const month = new Date().getMonth();
	const day = new Date().getDate();
	return new Date(year, month, day, hours, minutes);
};

const areTheSameDay = (date1, date2) => (
	date1.day() === date2.day() &&
	date1.month() === date2.month() &&
	date1.year() === date2.year()
);

const _getStorage = key => (
	JSON.parse(window.localStorage.getItem(key))
);

const _setStorage = (key, data) => {
	window.localStorage.setItem(key, JSON.stringify(data));
};

const setTodayStorage = (key, dayKey, data) => {
	const today = moment();
	_setStorage(dayKey, today);
	_setStorage(key, data);
};

const getTodayStorage = (key, dayKey) => {
	const dayOnLocal = moment(_getStorage(dayKey));
	const today = moment();
	if (dayKey in window.localStorage) {
		if (areTheSameDay(dayOnLocal, today)) {
			return _getStorage(key);
		}
	}
	setTodayStorage(key, dayKey, [{}, {}, {}, {}]);
	return [{}, {}, {}, {}];
};

const replacingValueInsideArray = (array, index, newValue) => [
	...array.slice(0, index),
	newValue,
	...array.slice(index + 1)
];


module.exports = {
	checkValidity,
	timeIsValid,
	getTimeFromDate,
	buildDateFromTimeString,
	areTheSameDay,
	getTodayStorage,
	setTodayStorage,
	replacingValueInsideArray,
	STORAGEKEY,
	STORAGEDAYKEY
};
