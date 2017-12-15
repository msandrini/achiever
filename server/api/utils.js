const cheerio = require('cheerio');
const moment = require('moment');

const errorMessageRegex = RegExp(/\$\('errmsg'\)\.update\('([a-zA-Z0-9 '\\/]+)'\);/, 'i');
const idRegex = RegExp(/&id=([0-9]+)&/, 'i');
const timeBreakRegex = RegExp(/([0-9]{1,2}:[0-9]{2}) to ([0-9]{1,2}:[0-9]{2})/, 'i');

const extractError = (responseHtml) => {
	const errorMessages = responseHtml.match(errorMessageRegex);

	if (errorMessages && errorMessages.length > 1) {
		return errorMessages[1];
	}

	return false;
};

const parseTimeToArray = timeAsString =>
	timeAsString.split(':').map(time => parseInt(time, 10));

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
		const types = [{
			id: parseInt($(`#${id}`).val(), 10),
			name: $('span').text().trim()
		}];

		return {
			default: types[0].id,
			types
		};
	}

	const types = $(`#${id} > option`).map((index, item) => ({
		id: parseInt($(item).val(), 10),
		name: $(item).text().trim()
	})).get().sort((a, b) => a.id - b.id);

	return {
		default: parseInt($(`#${id} > option:selected`).val(), 10),
		types
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

const activityToPayload = (activity) => {
	const PROJECT_PHASE = 329;
	const CODE_DEVELOPING_ACTIVITY = 7;

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

module.exports = {
	extractError,
	parseTimeToArray,
	extractId,
	extractSelectOptions,
	extractBreakTime,
	mapTableIntoArray,
	getOptions,
	stringfyTime,
	getUserDetails,
	activityToPayload
};
