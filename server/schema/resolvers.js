require('dotenv').config();
const {
	login,
	logout,
	addTimeEntry,
	delTimeEntry,
	dailyEntries,
	weekEntriesByDate,
	allEntries,
	activities,
	phases,
	userDetails,
	dayDetails
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
		allEntries: async (_, __, { token }) => (
			callWithAuth(allEntries(), token)
		),
		dayDetails: async (_, { date }, { token }) => (
			callWithAuth(dayDetails(date), token)
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
		delTimeEntry: async (_, { date }, { token }) => (
			callWithAuth(async () => {
				const timeEntry = await dailyEntries(date)(token);

				if (!timeEntry || !timeEntry.id) {
					return false;
				}

				const { workTimeId, breakTimeId } = timeEntry.id;

				if (workTimeId) {
					await delTimeEntry(token, workTimeId);
				}

				if (breakTimeId) {
					await delTimeEntry(token, breakTimeId);
				}

				return true;
			}, token)
		),
		updateTimeEntry: async (_, { timeEntry }, { token }) => (
			callWithAuth(async () => {
				const persistedTimeEntry = await dailyEntries(timeEntry.date)(token);

				const { workTimeId, breakTimeId } = persistedTimeEntry.id;

				if (workTimeId) {
					await delTimeEntry(token, workTimeId);
				}

				if (breakTimeId) {
					await delTimeEntry(token, breakTimeId);
				}

				return addTimeEntry(timeEntry)(token);
			}, token)
		)
	},
	Phase: {
		activities: async ({ id }, _, { token }) => (
			callWithAuth(activities(id), token)
		)
	}
};

module.exports = resolvers;
