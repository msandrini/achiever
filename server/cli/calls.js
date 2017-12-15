const { login, logout, addActivity } = require('../api/middleware');

const sendActivity = async (activity) => {
	const userDetails = await login();
	const result = await addActivity(userDetails, activity);
	await logout();

	return result;
};

module.exports = { sendActivity };
