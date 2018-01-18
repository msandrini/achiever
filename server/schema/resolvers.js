require('dotenv').config();
const {
	login,
	logout,
	addTimeEntry,
	delTimeEntry,
	dailyEntries,
	weekEntriesByDate,
	activities,
	phases,
	userDetails
} = require('../api/middleware');
const { tokenFactory } = require('../api/utils');

const notAuthorizedMessage = 'Not authorized!!!';

const callWithAuth = async (callback, token) => {
	if (!token) {
		throw notAuthorizedMessage;
	}

	let result;

	try {
		await login(token);
		result = await callback(token);
	} finally {
		await logout(token);
	}

	return result;
};

const resolvers = {
	Query: {
		weekEntries: async (_, { date }, { token }) => (
			callWithAuth(weekEntriesByDate(date), token)
		),
		dayEntry: async (_, { date }, { token }) => (
			{ timeEntry: callWithAuth(dailyEntries(date), token) }
		),
		phases: async (_, __, { token }) => (
			callWithAuth(phases(), token)
		),
		userDetails: async (_, __, { token }) => (
			callWithAuth(userDetails(), token)
		)
	},
	Mutation: {
		signIn: async (_, { user, password }) => {
			const token = tokenFactory(user, password);

			try {
				await login(token);
			} catch (error) {
				console.error('Login: ', error);
			} finally {
				await logout(token);
			}

			return { token };
		},
		addTimeEntry: async (_, { timeEntry }, { token }) => (
			callWithAuth(addTimeEntry(timeEntry), token)
		),
		delTimeEntry: async (_, { date }, { token }) => {
			if (!token) {
				throw notAuthorizedMessage;
			}

			try {
				await login(token);
				const timeEntry = await dailyEntries(date)(token);

				if (!timeEntry || !timeEntry.id) {
					await logout(token);

					return false;
				}

				const { workTimeId, breakTimeId } = timeEntry.id;

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
		activities: async ({ id }, _, { token }) => (
			callWithAuth(activities(id), token)
		)
	}
};

module.exports = resolvers;
