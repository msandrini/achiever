require('dotenv').config();
const jwt = require('jwt-simple');
const moment = require('moment');
const {
	login,
	logout,
	addTimeEntry,
	delTimeEntry,
	dailyEntries,
	weekEntriesByDate,
	activities,
	phases
} = require('../api/middleware');

const resolvers = {
	Query: {
		weekEntriesByDate: async (_, { date }, { token }) => {
			let result;

			try {
				await login(token);
				result = await weekEntriesByDate(token, date);
			} finally {
				await logout(token);
			}

			return result;
		},
		phasesByDate: async (_, { date }, { token }) => {
			let result;

			try {
				await login(token);
				result = await phases(token, date);
			} finally {
				await logout(token);
			}

			return result;
		}
	},
	Mutation: {
		signIn: async (_, { user, password }) => {
			const jwtSecret = process.env.JWT_SECRET;
			const token = jwt.encode({
				user,
				password,
				iat: moment().valueOf()
			}, jwtSecret);

			await login(token);

			return { token };
		},
		addTimeEntry: async (_, { activity }, { token }) => {
			let result;

			try {
				await login(token);
				result = await addTimeEntry(token, activity);
			} finally {
				await logout(token);
			}

			return result;
		},
		delTimeEntry: async (_, { date }, { token }) => {
			try {
				await login(token);
				const activity = await dailyEntries(token, date);

				if (!activity || !activity.id) {
					await logout(token);

					return false;
				}

				const { workTimeId, breakTimeId } = activity.id;

				if (workTimeId) {
					await delTimeEntry(token, workTimeId);
				}

				if (breakTimeId) {
					await delTimeEntry(token, breakTimeId);
				}
			} finally {
				await logout(token);
			}

			return true;
		}
	},
	Phase: {
		activities: async ({ id }, _, { token }) => {
			let result;

			try {
				await login(token);
				result = await activities(token, id);
			} finally {
				await logout(token);
			}

			return result;
		}
	}
};

module.exports = resolvers;
