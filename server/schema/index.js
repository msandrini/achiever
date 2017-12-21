const { makeExecutableSchema } = require('graphql-tools');
const resolvers = require('./resolvers');

const typeDefs = `
	input TimeEntryInput {
		date: String!,
		startTime: String!,
		endTime: String!,
		startBreakTime: String,
		endBreakTime: String
	}

	type TimeEntryId {
		workTimeId: Int,
		breakTimeId: Int
	}

	type TimeEntry {
		id: TimeEntryId,
		date: String!,
		employeeName: String,
		startTime: String,
		endTime: String,
		startBreakTime: String,
		endBreakTime: String,
		total: String
	}

	type WeekEntries {
		timeEntries: [TimeEntry]
		total: String
	}

	type Phase {
		id: Int,
		name: String
		activities: ActivityList
	}

	type PhaseList {
		default: Int,
		types: [Phase]
	}

	type Activity {
		id: Int,
		name: String
	}

	type ActivityList {
		default: Int,
		types: [Activity]
	}

	type Token {
		token: String
	}

	type Query {
		weekEntriesByDate(date: String!): WeekEntries
		phasesByDate: PhaseList
	}

	type Mutation {
		signIn(user: String!, password: String!): Token
		addTimeEntry(timeEntry: TimeEntryInput!): TimeEntry
		delTimeEntry(date: String!): Boolean
	}
`;

module.exports = makeExecutableSchema({ typeDefs, resolvers });
