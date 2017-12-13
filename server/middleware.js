require('dotenv').config();
const rp = require('request-promise');
const logger = require('./logger');
const cheerio = require('cheerio');

const url = process.env.SERVICE_URL;
const user = process.env.AUTH_USER;
const password = process.env.PASSWORD;

const authenticationSucceed = 'Your browser doesnt support frames, but this is required';
const PROJECT_PHASE = 329;
const CODE_DEVELOPING_ACTIVITY = 7;

const getOptions = (method, uri, cookieJar) => ({
	method,
	uri,
	jar: cookieJar,
	rejectUnauthorized: false
});

const logout = (cookieJar) => {
	const options = getOptions('GET', `${url}/index.php`, cookieJar);
	options.qs = {
		atklogout: 1
	};

	rp(options)
		.then(() => logger.info('Logged out!!!'))
		.catch(() => logger.error('Logout failed...'));
};

const getUserDetails = (resolve, cookieJar, userDetailsHtml) => {
	const $ = cheerio.load(userDetailsHtml);
	const formKey = $('input[type="hidden"][name="form_key"]').val();
	const personId = $('input[type="hidden"][name="person"]').val();

	return resolve({
		cookieJar,
		formKey,
		personId
	});
};

const handleAuthentication = (resolve, reject, cookieJar, html) => {
	if (html && html.includes(authenticationSucceed)) {
		logger.info('Authenticated!!!');
		const options = getOptions('GET', `${url}/dlabs/timereg/newhours_insert.php`, cookieJar);

		return rp(options)
			.then(userDetailsHtml =>
				getUserDetails(resolve, cookieJar, userDetailsHtml))
			.catch(() => reject(new Error('Get user details failed...')));
	}

	return reject(new Error('Invalid credentials...'));
};

const timekeep = (userDetails) => {
	const options = getOptions('POST', `${url}/dlabs/timereg/newhours_insert.php`, userDetails.cookieJar);
	const payload = {
		form_key: userDetails.formKey,
		person: userDetails.personId,
		init_userid: userDetails.personId,
		function: 'timereg_insert',
		diai: 7,
		mesi: 12,
		anoi: 2017,
		timehH: 8,
		timemH: 16,
		proj_phase: PROJECT_PHASE,
		proj_activity: CODE_DEVELOPING_ACTIVITY,
		remark: '',
		timeh: 1,
		timem: 0
	};

	options.formData = payload;

	return new Promise((resolve, reject) => {
		rp(options)
			.then(() => {
				logger.info('Time keeped!!!');
				payload.function = 'insert_break';
				payload.startBreak6 = '12:00';
				payload.startBreak6 = '13:00';
				options.formData = payload;

				rp(options)
					.then(() => {
						logger.info('Time break registered!!!');
						logout(userDetails.cookieJar);
						return resolve();
					})
					.catch((error) => {
						logger.error('Request failed %o', error.message);
						logout(userDetails.cookieJar);
						return reject(new Error('Timekeep insert_break failed...'));
					});
			})
			.catch((error) => {
				logger.error('Request failed %o', error.message);
				logout(userDetails.cookieJar);
				return reject(new Error('Timekeep timereg_insert failed...'));
			});
	});
};

const login = () => {
	const cookieJar = rp.jar();
	let options = getOptions('GET', `${url}/index.php`, cookieJar);

	return new Promise((resolve, reject) => {
		rp(options)
			.then(() => {
				options = getOptions('POST', `${url}/index.php`, cookieJar);
				options.formData = { auth_user: user, auth_pw: password };

				return rp(options)
					.then(body => handleAuthentication(resolve, reject, cookieJar, body))
					.catch(() => reject(new Error('Authentication failed...')));
			})
			.catch((error) => {
				logger.error('Achiever server is not running... %o', error.message);
				return reject(new Error('Achiever server is not running...'));
			});
	});
};

login()
	.then((userDetails) => {
		logger.info('User details: [form_key: %s, personId: %s]', userDetails.formKey, userDetails.personId);
		timekeep(userDetails);
	})
	.catch(error => logger.error('Login failed: %o', error));
