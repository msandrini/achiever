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
		phasesByDate: async (_, __, { token }) => {
			let result;

			try {
				await login(token);
				result = await phases(token);
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
		addTimeEntry: async (_, { timeEntry }, { token }) => {
			let result;

			try {
				await login(token);
				result = await addTimeEntry(token, timeEntry);
			} finally {
				await logout(token);
			}

			return result;
		},
		delTimeEntry: async (_, { date }, { token }) => {
			try {
				await login(token);
				const timeEntry = await dailyEntries(token, date);

				if (!timeEntry || !timeEntry.id) {
					await logout(token);

					return false;
				}

				const { workTimeId, breakTimeId } = timeEntry.id;

				if (workTimeId) {
					await delTimeEntry(token, workTimeId);
					console.info('Entry time deleted!!!');
				}

				if (breakTimeId) {
					await delTimeEntry(token, breakTimeId);
					console.info('Break time deleted!!!');
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
