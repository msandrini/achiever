require('dotenv').config();
const rp = require('request-promise');
const cheerio = require('cheerio');
const co = require('co');
const moment = require('moment');
const logger = require('../logger');
const {
	extractError,
	parseTimeToArray,
	extractId,
	extractBreakTime,
	mapTableIntoArray,
	getOptions,
	stringfyTime,
	getUserDetails,
	activityToPayload,
	extractSelectOptions
} = require('./utils');

const url = process.env.SERVICE_URL;
const user = process.env.AUTH_USER;
const password = process.env.PASSWORD;

const authenticationSucceed = 'Your browser doesnt support frames, but this is required';

const commonPayload = (userDetails, functionName) => ({
	form_key: userDetails.formKey,
	person: userDetails.personId,
	init_userid: userDetails.personId,
	function: functionName
});

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
}).catch((err) => { throw new Error(err); });

const logout = (cookieJar) => {
	const options = getOptions('GET', `${url}/index.php`, cookieJar);
	options.qs = {
		atklogout: 1
	};

	return rp(options)
		.then(() => logger.info('Logged out!!!'))
		.catch(() => logger.error('Logout failed...'));
};

const phaseTypes = (userDetails, date) => co(function* coroutine() {
	const { cookieJar } = userDetails;
	const options = getOptions('GET', `${url}/dlabs/timereg/timereg_lib.php`, cookieJar);
	options.qs = {
		datei: date,
		person: userDetails.personId,
		init_userid: userDetails.personId,
		function: 'proj_phase'
	};

	const responseHtml = yield rp(options);

	return extractSelectOptions('proj_phase', responseHtml);
}).catch((err) => { throw new Error(err); });

const activityTypes = (userDetails, date, phase) => co(function* coroutine() {
	const { cookieJar } = userDetails;
	const options = getOptions('GET', `${url}/dlabs/timereg/timereg_lib.php`, cookieJar);
	options.qs = {
		datei: date,
		person: userDetails.personId,
		init_userid: userDetails.personId,
		phase,
		function: 'proj_activity'
	};

	const responseHtml = yield rp(options);

	return extractSelectOptions('proj_activity', responseHtml);
}).catch((err) => { throw new Error(err); });

const dailyActivity = (userDetails, date) => co(function* coroutine() {
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
		[''] :
		mapTableIntoArray($, 'table tr.yellow td');

	const { startBreakTime, endBreakTime } = extractBreakTime(breakTime[0]);

	return {
		id: { workTimeId, breakTimeId },
		date,
		startTime: !workTime ? null : startTime.join(':'),
		endTime: !workTime ? null : endTime.join(':'),
		startBreakTime: startBreakTime || '',
		endBreakTime: endBreakTime || '',
		total: !workTime ? null : workTime[4]
	};
}).catch((err) => { throw new Error(err); });

const weeklyActivities = (userDetails, date) => co(function* coroutine() {
	const refDate = moment(date);
	refDate.day(1);

	const totalWorkedTime = moment().startOf('year');

	const activities = [];
	for (let i = 0; i < 7; i += 1) {
		const currentDate = refDate.format('YYYY-MM-DD');
		const activity = yield dailyActivity(userDetails, currentDate);
		if (activity && activity.total) {
			const dailyTotal = moment(activity.total, 'hh:mm');

			totalWorkedTime.add(dailyTotal.hour(), 'hours');
			totalWorkedTime.add(dailyTotal.minute(), 'minutes');
		}

		activities.push(activity);

		refDate.add(1, 'days');
	}

	const totalHours = totalWorkedTime.diff(moment().startOf('year'), 'hours');
	const totalMinutes = totalWorkedTime.diff(moment().startOf('year'), 'minutes') - (totalHours * 60);

	return {
		activities,
		total: stringfyTime(totalHours, totalMinutes)
	};
}).catch((err) => { throw new Error(err); });

const addActivity = (userDetails, activity) => {
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
	});
};

const delActivity = (userDetails, id) => co(function* coroutine() {
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
}).catch((err) => { throw new Error(err); });

module.exports = {
	login,
	logout,
	addActivity,
	delActivity,
	dailyActivity,
	weeklyActivities,
	activityTypes,
	phaseTypes
};
