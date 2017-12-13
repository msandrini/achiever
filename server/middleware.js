require('dotenv').config();
const rp = require('request-promise');
const logger = require('./logger');
const cheerio = require('cheerio');
const co = require('co');
const moment = require('moment');

const url = process.env.SERVICE_URL;
const user = process.env.AUTH_USER;
const password = process.env.PASSWORD;

const authenticationSucceed = 'Your browser doesnt support frames, but this is required';
const PROJECT_PHASE = 329;
const CODE_DEVELOPING_ACTIVITY = 7;
const errorMessageRegex = RegExp(/\$\('errmsg'\)\.update\('([a-zA-Z0-9 '\\/]+)'\);/, 'i');
const idRegex = RegExp(/&id=([0-9]+)&/, 'i');

const extractError = (responseHtml) => {
	const errorMessages = responseHtml.match(errorMessageRegex);

	if (errorMessages && errorMessages.length > 1) {
		return errorMessages[1];
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

const mapTableIntoArray = ($, selector) => (
	$(selector)
		.filter((index, item) =>
			$(item).text().trim() &&
			$(item).text().trim() !== '...' &&
			$(item).text().trim() !== '-')
		.map((index, item) => $(item).text().trim())
		.get()
);

const getOptions = (method, uri, cookieJar) => ({
	method,
	uri,
	jar: cookieJar,
	rejectUnauthorized: false
});

const getUserDetails = (cookieJar, userDetailsHtml) => {
	const $ = cheerio.load(userDetailsHtml);
	const formKey = $('input[type="hidden"][name="form_key"]').val();
	const personId = $('input[type="hidden"][name="person"]').val();

	return {
		cookieJar,
		formKey,
		personId
	};
};

const login = () => co(function* coroutine() {
	const cookieJar = rp.jar();
	let options = getOptions('GET', `${url}/index.php`, cookieJar);

	yield rp(options);

	options = getOptions('POST', `${url}/index.php`, cookieJar);
	options.formData = { auth_user: user, auth_pw: password };

	const loginResponseHtml = yield rp(options);
	let error = extractError(loginResponseHtml);
	if (error ||
		!loginResponseHtml ||
		!loginResponseHtml.includes(authenticationSucceed)) {
		throw error;
	}

	logger.info('Authenticated!!!');
	options = getOptions('GET', `${url}/dlabs/timereg/newhours_insert.php`, cookieJar);

	const userDetailsHtml = yield rp(options);
	error = extractError(userDetailsHtml);
	if (error) {
		throw error;
	}

	return getUserDetails(cookieJar, userDetailsHtml);
}).catch(err => logger.error('Request failed %s', err));

const logout = (cookieJar) => {
	const options = getOptions('GET', `${url}/index.php`, cookieJar);
	options.qs = {
		atklogout: 1
	};

	return rp(options)
		.then(() => logger.info('Logged out!!!'))
		.catch(() => logger.error('Logout failed...'));
};

const commonPayload = (userDetails, functionName) => ({
	form_key: userDetails.formKey,
	person: userDetails.personId,
	init_userid: userDetails.personId,
	function: functionName
});

const activityToPayload = (activity) => {
	const date = moment(activity.date);
	const startTime = moment(activity.startTime, 'hh:mm');
	const endTime = moment(activity.endTime, 'hh:mm');
	const startBreakTime = moment(activity.startBreakTime || '12:00', 'hh:mm');
	const endBreakTime = moment(activity.endBreakTime || '13:00', 'hh:mm');

	const totalBreakTime = moment().startOf('hour');
	totalBreakTime.add(endBreakTime.hour(), 'hours');
	totalBreakTime.add(endBreakTime.minute(), 'minutes');
	totalBreakTime.subtract(startBreakTime.hour(), 'hours');
	totalBreakTime.subtract(startBreakTime.minute(), 'minutes');

	const totalWorkedTime = moment().startOf('hour');
	totalWorkedTime.add(endTime.hour(), 'hours');
	totalWorkedTime.add(endTime.minute(), 'minutes');
	totalWorkedTime.subtract(startTime.hour(), 'hours');
	totalWorkedTime.subtract(startTime.minute(), 'minutes');
	totalWorkedTime.subtract(totalBreakTime.hour(), 'hours');
	totalWorkedTime.subtract(totalBreakTime.minute(), 'minutes');

	return {
		proj_phase: PROJECT_PHASE,
		proj_activity: CODE_DEVELOPING_ACTIVITY,
		remark: '',
		diai: date.date(),
		mesi: date.month() + 1,
		anoi: date.year(),
		timehH: startTime.hour(),
		timemH: startTime.minute(),
		startBreak6: activity.startBreakTime || '12:00',
		endBreak6: activity.endBreakTime || '13:00',
		timeh: totalWorkedTime.hour(),
		timem: totalWorkedTime.minute()
	};
};

const listDailyActivities = (userDetails, date) => co(function* coroutine() {
	const { cookieJar } = userDetails;
	const options = getOptions('GET', `${url}/dlabs/timereg/newhours_list.php`, cookieJar);
	options.qs = { datei: date };

	const responseHtml = yield rp(options);
	const $ = cheerio.load(responseHtml);
	const workTimeResponse = $('table tr.green a').prop('onclick');
	const workTimeId = extractId(workTimeResponse);
	const workTime = !workTimeId ?
		null :
		mapTableIntoArray($, 'table tr.green td');
	const startTime = !workTime
		? [0, 0]
		: parseTimeToArray(workTime[1]);
	const endTime = !workTime
		? [0, 0]
		: parseTimeToArray(workTime[4])
			.map((time, index) => startTime[index] + time);

	const breakTimeResponse = $('table tr.yellow a').prop('onclick');
	const breakTimeId = extractId(breakTimeResponse);
	const breakTime = !breakTimeId ?
		null :
		mapTableIntoArray($, 'table tr.yellow td');

	return {
		id: { workTimeId, breakTimeId },
		startTime: !workTime ? null : startTime.join(':'),
		endTime: !workTime ? null : endTime.join(':'),
		total: !workTime ? null : workTime[4],
		breakTime
	};
}).catch(err => logger.error('Request failed %s', err));

const dailyActivity = (userDetails, date) => co(function* coroutine() {
	const {
		id,
		startTime,
		endTime,
		total
	} = yield listDailyActivities(userDetails, date);

	return {
		id,
		date,
		startTime,
		startBreakTime: '',
		endBreakTime: '',
		endTime,
		total
	};
}).catch(err => logger.error('Request failed %s', err));

const weeklyActivities = (userDetails, date) => co(function* coroutine() {
	const refDate = moment(date);
	refDate.day(1);

	const activities = [];
	for (let i = 0; i < 7; i += 1) {
		const currentDate = refDate.format('YYYY-MM-DD');
		const activity = yield dailyActivity(userDetails, currentDate);

		activities.push(activity);

		refDate.add(1, 'days');
	}

	return activities;
}).catch(err => logger.error('Request failed %s', err));

const listWeekActivities = (userDetails, date) => co(function* coroutine() {
	const { cookieJar } = userDetails;
	const options = getOptions('GET', `${url}/dlabs/timereg/newhours_list_wview.php`, cookieJar);
	options.qs = { datei: date };

	const responseHtml = yield rp(options);
	const $ = cheerio.load(responseHtml);

	const headers = mapTableIntoArray($, 'table tr.grayH th');
	const values = mapTableIntoArray($, 'table tr.yellow td');
	const completeValues = [
		...values.slice(0, values.length - 1),
		...Array(headers.length - values.length).fill(''),
		values[values.length - 1]];

	const response = {};
	headers.forEach((header, index) => {
		response[header] = completeValues[index];
	});

	return response;
}).catch(err => logger.error('Request failed %s', err));

const timekeep = (userDetails, activity) => {
	const options = getOptions('POST', `${url}/dlabs/timereg/newhours_insert.php`, userDetails.cookieJar);
	const payload = {
		...commonPayload(userDetails, 'timereg_insert'),
		...activityToPayload(activity)
	};

	options.formData = payload;

	return co(function* coroutine() {
		const body = yield rp(options);
		let error = extractError(body);
		if (error) {
			throw error;
		}
		logger.info('Time keeped!!!');

		options.formData = { ...payload, function: 'insert_break' };

		const timeBreakHTML = yield rp(options);

		error = extractError(timeBreakHTML);
		if (error) {
			throw error;
		}

		logger.info('Time break registered!!!');

		return yield dailyActivity(userDetails, activity.date);
	}).catch(err => logger.error('Request failed %s', err));
};

const deleteTimekeep = (userDetails, id) => co(function* coroutine() {
	const { cookieJar } = userDetails;
	let options = getOptions('GET', `${url}/dlabs/timereg/newhours_delete.php`, cookieJar);
	const deleteFormHtml = yield rp({
		...options,
		qs: { id }
	});
	let error = extractError(deleteFormHtml);
	if (error) {
		throw error;
	}

	const $ = cheerio.load(deleteFormHtml);
	const formKey = $('input[type="hidden"][name="form_key"]').val();

	options = getOptions('POST', `${url}/dlabs/timereg/timereg_lib.php`, cookieJar);
	const payload = {
		id,
		form_key: formKey,
		person: userDetails.personId,
		init_userid: userDetails.personId,
		function: 'timereg_delete'
	};

	options.formData = payload;

	const deleteResponseHtml = yield rp(options);
	error = extractError(deleteResponseHtml);
	if (error) {
		throw error;
	}

	logger.info('Time deleted!!!');
}).catch(err => logger.error(`Delete worktime failed ${err}`));

module.exports = {
	login,
	logout,
	timekeep,
	deleteTimekeep,
	dailyActivity,
	weeklyActivities,
	listWeekActivities
};
