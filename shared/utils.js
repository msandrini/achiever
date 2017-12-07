const _isNumber = value => !Number.isNaN(parseInt(value, 10));

const checkValidity = {
	minutes: mins => _isNumber(mins) && mins < 60 && mins >= 0,
	hours: hs => _isNumber(hs) && hs < 24 && hs >= 0
};

const timeIsValid = time => checkValidity.minutes(time.minutes) &&
	checkValidity.hours(time.hours);

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

module.exports = {
	checkValidity,
	timeIsValid,
	getTimeFromDate,
	buildDateFromTimeString
};
