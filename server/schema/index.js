const { makeExecutableSchema } = require('graphql-tools');
const resolvers = require('./resolvers');

const typeDefs = `
	input TimeEntryInput {
		date: String!,
		startTime: String!,
		endTime: String!,
		startBreakTime: String,
		endBreakTime: String,
		phaseId: Int,
		activityId: Int
	}

	type TimeEntryId {
		workTimeId: Int,
		breakTimeId: Int
	}

	type TimeEntry {
		id: TimeEntryId,
		date: String!,
		phase: String,
		activity: String,
		startTime: String,
		endTime: String,
		startBreakTime: String,
		endBreakTime: String,
		total: String
	}

	type Entries {
		date: String
		contractedTime: String
		startTime: String
		endTime: String
		startBreakTime: String
		endBreakTime: String
		total: String
		weekBalance: String
		balance: String
		isVacation: Boolean
		isOtanjoubi: Boolean
		isJustifiedAbsence: Boolean
		isHoliday: Boolean
		holiday: String
	}

	type AllEntries {
		name: String
		admission: String
		entries: [Entries]
	}

	type WeekEntries {
		timeEntries: [TimeEntry]
		total: String
	}

	type DayEntry {
		timeEntry: TimeEntry
	}

	type Phase {
		id: Int,
		name: String
		activities: ActivityList
	}

	type PhaseList {
		default: Int,
		options: [Phase]
	}

	type Activity {
		id: Int,
		name: String
	}

	type ActivityList {
		default: Int,
		options: [Activity]
	}

	type Token {
		token: String
	}

	type UserDetails {
		name: String!
		dailyContractedHours: String!
		lastFridayBalance: String!
	}

	type DayDetails {
		date: String!,
		phase: String,
		activity: String
	}

	type ChangePasswordData {
		id: String
		atkprevlevel: String
		atkstackid: String
		achievo: String
		atkescape: String
		atkaction: String
		atknodetype: String
		atkprimkey: String
		userid: String
		passwordHash: String
		atknoclose: String
	}

	type Query {
		userDetails: UserDetails
		weekEntries(date: String!): WeekEntries
		allEntries: AllEntries
		dayEntry(date: String!): DayEntry
		dayDetails(date: String!): DayDetails
		phases: PhaseList
		changePasswordData: ChangePasswordData
	}

	type Mutation {
		signIn(user: String!, password: String!): Token
		addTimeEntry(timeEntry: TimeEntryInput!): TimeEntry
		delTimeEntry(date: String!): Boolean
		updateTimeEntry(timeEntry: TimeEntryInput!): TimeEntry
		changePassword(currentPassword: String!, newPassword: String!): String!
	}
`;

module.exports = makeExecutableSchema({ typeDefs, resolvers });
