import PropTypes from 'prop-types';

export const Entries = PropTypes.shape({
	date: PropTypes.string,
	startTime: PropTypes.string,
	startBreakTime: PropTypes.string,
	endBreakTime: PropTypes.string,
	endTime: PropTypes.string,
	total: PropTypes.string,
	contractedTime: PropTypes.string,
	weekBalance: PropTypes.string,
	balance: PropTypes.string,
	phase: PropTypes.string,
	activity: PropTypes.string
});

export const Activities = PropTypes.shape({
	default: PropTypes.number,
	options: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.number,
		name: PropTypes.string
	}))
});

export const Phases = PropTypes.shape({
	default: PropTypes.number,
	options: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.number,
		name: PropTypes.string,
		activities: Activities
	}))
});

export const DayDetails = PropTypes.shape({
	date: PropTypes.string,
	phase: PropTypes.string,
	activity: PropTypes.string
});

export const AllEntriesQuery = PropTypes.shape({
	allEntries: PropTypes.shape({
		admission: PropTypes.string,
		name: PropTypes.string,
		entries: PropTypes.arrayOf(Entries)
	}),
	error: PropTypes.string,
	loading: PropTypes.bool
});

export const PhasesQuery = PropTypes.shape({
	phases: Phases,
	error: PropTypes.string,
	loading: PropTypes.bool
});

export const DayDetailsQuery = PropTypes.shape({
	dayDetails: DayDetails,
	error: PropTypes.string,
	loading: PropTypes.bool
});
