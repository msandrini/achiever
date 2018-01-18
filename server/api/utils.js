const cheerio = require('cheerio');
const jwt = require('jwt-simple');
const md5 = require('md5');
const moment = require('moment');
const rp = require('request-promise');
const tough = require('tough-cookie');

const errorMessageRegex = RegExp(/\$\('errmsg'\)\.update\('([^\0]+)'\);\s*<\/script>/, 'i');
const idRegex = RegExp(/&id=([0-9]+)&/, 'i');
const timeBreakRegex = RegExp(/([0-9]{1,2}:[0-9]{2}) to ([0-9]{1,2}:[0-9]{2})/, 'i');
const normaliseStringRegex = RegExp(/<[a-z ]+\/>|\\|\s\r?\n/, 'gi');

const ACHIEVO_URL = process.env.SERVICE_URL;
const jwtSecret = process.env.JWT_SECRET;

const loggedInUsers = new Map();

const extractError = (responseHtml) => {
	const errorMessages = responseHtml.match(errorMessageRegex);

	if (errorMessages && errorMessages.length > 1) {
		const message = errorMessages[1].replace(normaliseStringRegex, '');
		return message;
	}

	return false;
};

const parseTimeToArray = timeAsString => timeAsString.split(':').map(time => parseInt(time, 10));

const extractId = (responseHtml) => {
	if (!responseHtml) {
		return null;
	}

	const id = responseHtml.match(idRegex);

	if (id && id.length > 1) {
		return id[1];
	}

	return null;
};

const extractBreakTime = (response) => {
	if (!response) {
		return {};
	}

	const times = response.match(timeBreakRegex);

	if (times && times.length > 2) {
		return {
			startBreakTime: times[1],
			endBreakTime: times[2]
		};
	}

	return {};
};

const extractSelectOptions = (id, response) => {
	const $ = cheerio.load(response);
	const isOptionList = $(`#${id}`).is('select');

	if (!isOptionList) {
		const options = [{
			id: parseInt($(`#${id}`).val(), 10),
			name: $('span').text().trim()
		}];

		return {
			default: options[0].id,
			options
		};
	}

	const options = $(`#${id} > option`).map((index, item) => ({
		id: parseInt($(item).val(), 10),
		name: $(item).text().trim()
	})).get().sort((a, b) => a.id - b.id);

	return {
		default: parseInt($(`#${id} > option:selected`).val(), 10),
		options
	};
};

const mapTableIntoArray = ($, selector) => (
	$(selector)
		.filter((index, item) =>
			$(item).text().trim() &&
			$(item).text().trim() !== '...' &&
			$(item).text().trim() !== '-')
		.map((index, item) => $(item).text().trim())
		.get()
);

const workTimeFromHtml = ($) => {
	const workTimeResponse = $('table tr.green a').eq(0).prop('onclick');
	const workTimeId = extractId(workTimeResponse);
	const startTime = $('table tr.green td').eq(1).text().trim();
	const phase = $('table tr.green td').eq(2).text().trim();
	const activity = $('table tr.green td').eq(3).text().trim();
	const total = $('table tr.green td').eq(5).text().trim();

	return {
		workTimeId,
		startTime,
		phase,
		activity,
		total
	};
};

const breakTimeFromHtml = ($) => {
	const breakTimeResponse = $('table tr.yellow a').prop('onclick');
	const breakTimeId = extractId(breakTimeResponse);
	const breakTimeDuration = $('table tr.yellow td').eq(3).text().trim();
	const breakTime = $('table tr.yellow td').eq(1).text().trim();

	const { startBreakTime, endBreakTime } = extractBreakTime(breakTime);

	return {
		breakTimeId,
		startBreakTime,
		endBreakTime,
		breakTimeDuration
	};
};

const getOptions = (method, uri, cookieJar) => ({
	method,
	uri,
	jar: cookieJar,
	rejectUnauthorized: false
});

const stringfyTime = (hours, minutes) => {
	const stringifiedHour = hours < 10 ? `0${hours}` : `${hours}`;
	const stringifiedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;

	return `${stringifiedHour}:${stringifiedMinutes}`;
};

const activityToPayload = (timeEntry, phaseId, activityId) => {
	const date = moment(timeEntry.date);
	const startTime = moment(timeEntry.startTime, 'H:mm');
	const endTime = moment(timeEntry.endTime, 'H:mm');
	const startBreakTime = moment(timeEntry.startBreakTime || '12:00', 'H:mm');
	const endBreakTime = moment(timeEntry.endBreakTime || '13:00', 'H:mm');

	const totalWorkedTime = moment().startOf('day');

	totalWorkedTime.add({
		hours: endTime.hours(),
		minutes: endTime.minutes()
	});

	totalWorkedTime.subtract({
		hours: startTime.hours(),
		minutes: startTime.minutes()
	});

	totalWorkedTime.add({
		hours: startBreakTime.hours(),
		minutes: startBreakTime.minutes()
	});

	totalWorkedTime.subtract({
		hours: endBreakTime.hours(),
		minutes: endBreakTime.minutes()
	});

	return {
		proj_phase: phaseId,
		proj_activity: activityId,
		remark: '',
		diai: date.date(),
		mesi: date.month() + 1,
		anoi: date.year(),
		timehH: startTime.hours(),
		timemH: startTime.minutes(),
		startBreak6: timeEntry.startBreakTime || '12:00',
		endBreak6: timeEntry.endBreakTime || '13:00',
		timeh: totalWorkedTime.hours(),
		timem: totalWorkedTime.minutes()
	};
};

/**
 * Generates a jwt token using user and password
 * @param  {String} user=process.env.AUTH_USER
 * @param  {String} password=process.env.PASSWORD
 */
const tokenFactory = (user = process.env.AUTH_USER, password = process.env.PASSWORD) => (
	jwt.encode({
		user,
		password,
		iat: moment().valueOf()
	}, jwtSecret)
);

const cookieJarFactory = (token) => {
	const cookieJar = rp.jar();
	const cookie = new tough.Cookie({
		key: 'achievo',
		value: md5(token)
	});
	cookieJar.setCookie(cookie, ACHIEVO_URL);

	return cookieJar;
};

/**
 * Check whether userToken is in use or not
 * @param  {String} userToken token sent by user
 * @param  {Map} map is a hashmap containing all tokens; by default is a global loggedInUsers
 * @returns {Number} number of uses
 */
const thereIsSessionFrom = (userToken, map = loggedInUsers) => {
	const sessionsCounter = map.get(userToken);
	if (sessionsCounter === undefined) {
		return 0;
	}
	return sessionsCounter;
};

/**
 * Increment the number of sessions of userToken
 * @param  {String} userToken token sent by user
 * @param  {Map} map is a hashmap containing all tokens; by default is a global loggedInUsers
 */
const setSession = (userToken, map = loggedInUsers) => {
	map.set(userToken, thereIsSessionFrom(userToken) + 1);
};

/**
 * Decrement the number of sessions of userToken
 * @param  {String} userToken token sent by user
 * @param  {Map} map is a hashmap containing all tokens; by default is a global loggedInUsers
 * @returns {Number} number of sessions of userToken after remove
 */
const removeSession = (userToken, map = loggedInUsers) => {
	const sessionsCounter = thereIsSessionFrom(userToken);
	if (sessionsCounter === 0) {
		// This is error - called remove logout and it was not logged in
	} else if (sessionsCounter === 1) {
		map.delete(userToken);
	} else {
		map.set(userToken, sessionsCounter - 1);
	}
	return (sessionsCounter - 1);
};

module.exports = {
	ACHIEVO_URL,
	extractError,
	parseTimeToArray,
	extractId,
	extractSelectOptions,
	extractBreakTime,
	mapTableIntoArray,
	getOptions,
	stringfyTime,
	activityToPayload,
	workTimeFromHtml,
	breakTimeFromHtml,
	tokenFactory,
	cookieJarFactory,
	thereIsSessionFrom,
	setSession,
	removeSession
};
