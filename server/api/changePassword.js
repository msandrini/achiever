const rp = require('request-promise');
const cheerio = require('cheerio');
const logger = require('../logger');
const {
	getUserDetails
} = require('./middleware');

const {
	ACHIEVO_URL,
	extractError,
	getOptions,
	cookieJarFactory
} = require('./utils');

const extractChangePasswordData = ($) => {
	const id = $('input[type="hidden"][name="id"]').val();
	const atkprevlevel = $('input[type="hidden"][name="atkprevlevel"]').val();
	const atkstackid = $('input[type="hidden"][name="atkstackid"]').val();
	const achievo = $('input[type="hidden"][name="achievo"]').val();
	const atkescape = $('input[type="hidden"][name="atkescape"]').val();
	const atkaction = $('input[type="hidden"][name="atkaction"]').val();
	const atknodetype = $('input[type="hidden"][name="atknodetype"]').val();
	const atkprimkey = $('input[type="hidden"][name="atkprimkey"]').val();
	const userid = $('input[type="hidden"][name="userid"]').val();
	const passwordHash = $('input[type="hidden"][name="password[hash]"]').val();
	const atknoclose = $('input[type="submit"][name="atknoclose"]').val();

	return {
		id,
		atkprevlevel,
		atkstackid,
		achievo,
		atkescape,
		atkaction,
		atknodetype,
		atkprimkey,
		userid,
		passwordHash,
		atknoclose
	};
};

const getChangePasswordData = async (token) => {
	const cookieJar = cookieJarFactory(token);
	const { personId } = await getUserDetails(cookieJar);

	const options = getOptions('GET', `${ACHIEVO_URL}/dispatch.php`, cookieJar);
	options.qs = {
		atknodetype: 'employee.userprefs',
		atkaction: 'edit',
		atkselector: `person.id='${personId}'`
	};
	const changePasswordHtml = await rp(options);

	const error = extractError(changePasswordHtml);
	if (error) {
		throw error;
	}

	const $ = cheerio.load(changePasswordHtml);

	return extractChangePasswordData($);
};

const changePassword = passwordData => async (token) => {
	const cookieJar = cookieJarFactory(token);

	const {
		id,
		atkprevlevel,
		atkstackid,
		achievo,
		atkescape,
		atkaction,
		atknodetype,
		atkprimkey,
		userid,
		passwordHash,
		atknoclose
	} = await getChangePasswordData(token);

	const {
		currentPassword,
		newPassword
	} = passwordData;

	const options = getOptions('POST', `${ACHIEVO_URL}/dispatch.php?`, cookieJar);
	const payload = {
		id,
		atkprevlevel,
		atkstackid,
		achievo,
		atkescape,
		atkaction,
		atknodetype,
		atkprimkey,
		userid,
		'password[hash]': passwordHash,
		'password[current]': currentPassword,
		'password[new]': newPassword,
		'password[again]': `${newPassword}`,
		atknoclose
	};

	options.formData = payload;
	const body = await rp(options);

	const $ = cheerio.load(body);
	const error = $('.error').text();
	if (error) {
		throw error.split('\n').map(line => line.trim()).join('<br/>');
	}

	logger.info('Password changed!!!');

	return true;
};

module.exports = {
	extractChangePasswordData,
	getChangePasswordData,
	changePassword
};
