const logger = require('../logger');
const co = require('co');

const {
	login,
	logout,
	addActivity,
	delActivity,
	dailyActivity,
	weeklyActivities,
	activityTypes,
	phaseTypes
} = require('../api/middleware');

const resolvers = {
	Query: {
		dailyActivity: (_, { date }) => co(function* coroutine() {
			const userDetails = yield login();

			const result = yield dailyActivity(userDetails, date);

			yield logout();

			return result;
		}).catch(err => logger.error('Request failed %o', err)),
		weeklyActivities: (_, { date }) => co(function* coroutine() {
			const userDetails = yield login();

			const result = yield weeklyActivities(userDetails, date);

			yield logout();

			return result;
		}).catch(err => logger.error('Request failed %o', err)),
		phaseTypes: (_, { date }) => co(function* coroutine() {
			const userDetails = yield login();

			const result = yield phaseTypes(userDetails, date);

			yield logout();

			return result;
		}).catch(err => logger.error('Request failed %o', err)),
		activityTypes: (_, { date, phaseId }) => co(function* coroutine() {
			const userDetails = yield login();

			const result = yield activityTypes(userDetails, date, phaseId);

			yield logout();

			return result;
		}).catch(err => logger.error('Request failed %o', err))
	},
	Mutation: {
		addActivity: (_, { activity }) => co(function* coroutine() {
			const userDetails = yield login();

			const result = yield addActivity(userDetails, activity);

			yield logout();

			return result;
		}).catch(err => logger.error('Request failed %o', err)),
		delActivity: (_, { date }) => co(function* coroutine() {
			const userDetails = yield login();

			const activity = yield dailyActivity(userDetails, date);

			if (!activity || !activity.id) {
				yield logout();
				return false;
			}

			const { workTimeId, breakTimeId } = activity.id;

			if (workTimeId) {
				yield delActivity(userDetails, workTimeId);
			}

			if (breakTimeId) {
				yield delActivity(userDetails, breakTimeId);
			}

			yield logout();

			return true;
		}).catch(err => logger.error('Request failed %o', err))
	}
};

module.exports = resolvers;
