const { makeExecutableSchema } = require('graphql-tools');
const resolvers = require('./resolvers');

const typeDefs = `
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

	type Type {
		id: Int,
		name: String
	}

	type TypeList {
		default: Int,
		types: [Type]
	}

	type Query {
		dailyActivity(date: String!): Activity
		weeklyActivities(date: String!): WeekActivities
		phaseTypes(date: String!): TypeList
		activityTypes(date: String!, phaseId: Int!): TypeList
	}

	type Mutation {
		addActivity(activity: ActivityInput!): Activity
		delActivity(date: String!): Boolean
	}
`;

module.exports = makeExecutableSchema({ typeDefs, resolvers });
