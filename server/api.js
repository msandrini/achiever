const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');
const logger = require('./logger');
const co = require('co');
const {
	login,
	logout,
	addActivity,
	delActivity,
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
		startTime: String,
		endTime: String,
		startBreakTime: String,
		endBreakTime: String,
		total: String
	}

	type WeekActivities {
		activities: [Activity]
		total: String
	}

	type Query {
		dailyActivity(date: String!): Activity
		weeklyActivities(date: String!): WeekActivities
	}

	type Mutation {
		addActivity(activity: ActivityInput!): Activity
		delActivity(date: String!): Boolean
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
	addActivity: ({ activity }) => co(function* coroutine() {
		const userDetails = yield login();

		const result = yield addActivity(userDetails, activity);

		yield logout();

		return result;
	}).catch(err => logger.error('Request failed %o', err)),
	delActivity: ({ date }) => co(function* coroutine() {
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
};

module.exports = graphqlHTTP({
	schema,
	rootValue: root,
	graphiql: true
});
