const logger = require('../logger');
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
		dailyActivity: async (_, { date }) => {
			const userDetails = await login();

			const result = await dailyActivity(userDetails, date);

			await logout();

			return result;
		},
		weeklyActivities: async (_, { date }) => {
			const userDetails = await login();

			const result = await weeklyActivities(userDetails, date);

			await logout();

			return result;
		},
		phaseTypes: async (_, { date }) => {
			const userDetails = await login();

			const result = await phaseTypes(userDetails, date);

			await logout();

			return result;
		},
		activityTypes: async (_, { date, phaseId }) => {
			const userDetails = await login();

			const result = await activityTypes(userDetails, date, phaseId);

			await logout();

			return result;
		}
	},
	Mutation: {
		addActivity: async (_, { activity }) => {
			const userDetails = await login();

			const result = await addActivity(userDetails, activity);

			await logout();

			return result;
		},
		delActivity: async (_, { date }) => {
			const userDetails = await login();

			const activity = await dailyActivity(userDetails, date);

			if (!activity || !activity.id) {
				await logout();

				return false;
			}

			const { workTimeId, breakTimeId } = activity.id;

			if (workTimeId) {
				await delActivity(userDetails, workTimeId);
			}

			if (breakTimeId) {
				await delActivity(userDetails, breakTimeId);
			}

			await logout();

			return true;
		}
	}
};

module.exports = resolvers;
