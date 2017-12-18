/* global window */

const STORAGEKEY = 'storedTimes';

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

const getStorage = name => (
	JSON.parse(window.localStorage.getItem(name))
);

const setStorage = (name, data) => {
	window.localStorage.setItem(name, JSON.stringify(data));
};


module.exports = {
	checkValidity,
	timeIsValid,
	getTimeFromDate,
	buildDateFromTimeString,
	getStorage,
	setStorage,
	STORAGEKEY
};
