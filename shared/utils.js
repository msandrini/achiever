const axios = require('axios');

const _isNumber = value => !Number.isNaN(parseInt(value, 10));

const checkValidity = {
	minutes: mins => _isNumber(mins) && mins < 60 && mins >= 0,
	hours: hs => _isNumber(hs) && hs < 24 && hs >= 0
};

const timeIsValid = time => checkValidity.minutes(time.minutes) &&
    checkValidity.hours(time.hours);

const api = axios.create({
	baseURL: 'https://localhost:3000'
});

const apiCalls = {
	sendTimes: () => Promise.resolve(true),
	getTimes: () => api.get('/times')
};

module.exports = {
	checkValidity,
	timeIsValid,
	apiCalls
};
