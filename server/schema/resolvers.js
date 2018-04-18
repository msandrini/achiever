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
const {
	changePassword
} = require('../api/changePassword');

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
		await logout(token);
	} catch (error) {
		await logout(token);
		throw error;
	}

	return result;
};

const resolvers = {
	Query: {
		weekEntries: async (_, { date }, { token }) => (
			callWithAuth(weekEntriesByDate(date), token).catch(error => error)
		),
		allEntries: async (_, __, { token }) => (
			callWithAuth(allEntries(), token).catch(error => error)
		),
		dayDetails: async (_, { date }, { token }) => (
			callWithAuth(dayDetails(date), token).catch(error => error)
		),
		dayEntry: async (_, { date }, { token }) => (
			{ timeEntry: callWithAuth(dailyEntries(date), token) }
		),
		phases: async (_, __, { token }) => (
			callWithAuth(phases(), token).catch(error => error)
		),
		userDetails: async (_, __, { token }) => (
			callWithAuth(userDetails(), token).catch(error => error)
		)
	},
	Mutation: {
		signIn: async (_, { user, password }) => {
			const token = tokenFactory(user, password);

			await login(token);

			return { token };
		},
		addTimeEntry: async (_, { timeEntry }, { token }) => (
			callWithAuth(addTimeEntry(timeEntry), token).catch(error => error)
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
			}, token).catch(error => error)
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
			}, token).catch(error => error)
		),
		changePassword: async (_, { currentPassword, newPassword }, { token }) => (
			callWithAuth(changePassword({ currentPassword, newPassword }), token)
				.catch(error => error)
		)
	},
	Phase: {
		activities: async ({ id }, _, { token }) => (
			callWithAuth(activities(id), token)
		)
	}
};

module.exports = resolvers;
