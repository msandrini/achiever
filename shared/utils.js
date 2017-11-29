const axios = require('axios');

const checkValidity = {
    minutes: mins => isNumber(mins) && mins < 60 && mins >= 0,
    hours: hs => isNumber(hs) && hs < 24 && hs >= 0
}

const timeIsValid = time => checkValidity.minutes(time.minutes) &&
    checkValidity.hours(time.hours);

const isNumber = value => !isNaN(parseInt(value, 10));

const api = axios.create({
    baseURL: 'https://localhost:3000'
});

const apiCalls = {
    sendTimes: data => Promise.resolve(true),
    getTimes: () => api.get('/times')
};

module.exports = {
    checkValidity,
    timeIsValid,
    apiCalls
};