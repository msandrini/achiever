const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');
const logger = require('./logger');
const co = require('co');
const {
	login,
	logout,
	timekeep,
	deleteTimekeep,
	dailyActivity,
	weeklyActivities
} = require('./middleware');

const schema = buildSchema(`
	input ActivityInput {
		date: String!,
		startTime: String!,
		endTime: String!,
		startBreakTime: String,
		endBreakTime: String
	}

	type ActivityId {
		workTimeId: Int,
		breakTimeId: Int
	}

	type Activity {
		id: ActivityId,
		date: String!,
		startTime: String!,
		endTime: String!,
		startBreakTime: String,
		endBreakTime: String,
		total: String
	}

	type Query {
		dailyActivity(date: String!): Activity
		weeklyActivities(date: String!): [Activity]
	}

	type Mutation {
		setActivity(activity: ActivityInput!): Activity
		deleteActivity(date: String!): Boolean
	}
`);

const root = {
	dailyActivity: ({ date }) => co(function* coroutine() {
		const userDetails = yield login();

		const result = yield dailyActivity(userDetails, date);

		yield logout();

		return result;
	}).catch(err => logger.error('Request failed %o', err)),
	weeklyActivities: ({ date }) => co(function* coroutine() {
		const userDetails = yield login();

		const result = yield weeklyActivities(userDetails, date);

		yield logout();

		return result;
	}).catch(err => logger.error('Request failed %o', err)),
	setActivity: ({ activity }) => co(function* coroutine() {
		const userDetails = yield login();

		const result = yield timekeep(userDetails, activity);

		yield logout();

		return result;
	}).catch(err => logger.error('Request failed %o', err)),
	deleteActivity: ({ date }) => co(function* coroutine() {
		const userDetails = yield login();

		const activity = yield dailyActivity(userDetails, date);

		if (!activity || !activity.id) {
			yield logout();

			return false;
		}

		const { workTimeId, breakTimeId } = activity.id;

		if (workTimeId) {
			yield deleteTimekeep(userDetails, workTimeId);
		}

		if (breakTimeId) {
			yield deleteTimekeep(userDetails, breakTimeId);
		}

		yield logout();

		return true;
	}).catch(err => logger.error('Request failed %o', err))
};

module.exports = graphqlHTTP({
	schema,
	rootValue: root,
	graphiql: true
});
