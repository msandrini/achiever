import React from 'react';
import { graphql, compose } from 'react-apollo';
import moment from 'moment';
import TimeDuration from 'time-duration';

import TimeEntry from '../components/timeEntry/TimeEntry';
import * as queries from '../queries.graphql';
import {
	AllEntriesQuery,
	PhasesQuery,
	DayDetailsQuery
} from '../PropTypes';

const _getActivities = (phases) => {
	const reducer = (dictionary, phase) => {
		dictionary.set(phase.name, phase.activities.options.map(activity => activity.name));
		return dictionary;
	};

	return phases.options.reduce(reducer, new Map());
};

const _getPhases = phases => phases.options.map(phase => phase.name);

const _getDefaultPhase = phases => phases.options.find(phase => phase.id === phases.default);

const _getDefaultActivity = activities => activities.options
	.find(activity => activity.id === activities.default);

const _isSpecialCases = (activities, selectedActivity) =>
	!activities.includes(selectedActivity);

const _numberfyTime = value => (new TimeDuration(value)).toMinutes();

const _getStatistics = (selectedDate, entry) => ({
	dayBalance: _numberfyTime(entry.total),
	weekBalance: _numberfyTime(entry.weekBalance),
	totalBalance: _numberfyTime(entry.balance),
	contractedTime: _numberfyTime(entry.contractedTime),
	weekDay: moment(selectedDate).isoWeekday()
});

const _handleDateChange = date => (_, props) => {
	const {
		entries
	} = props.allEntriesQuery.allEntries || { entries: [{}] };

	return {
		selectedDate: date.format('YYYY-MM-DD'),
		selectedEntry: entries.find(data =>
			data.date === date.format('YYYY-MM-DD'))
	};
};

const _handleDayDetailsQueryUpdate = (prevState, props) => {
	const {
		phase,
		activity
	} = props.dayDetailsQuery.dayDetails || {};

	return {
		selectedPhase: phase || prevState.defaultPhase,
		selectedActivity: activity || prevState.defaultActivity
	};
};

const _handlePhasesQueryUpdate = (prevState, props) => {
	const { phases } = props.phasesQuery;

	const defaultPhase = _getDefaultPhase(phases);
	const defaultActivity = _getDefaultActivity(defaultPhase.activities);

	return {
		phases: _getPhases(phases),
		activitiesMap: _getActivities(phases),
		defaultPhase: defaultPhase.name,
		defaultActivity: defaultActivity.name,
		selectedPhase: prevState.selectedPhase || defaultPhase.name,
		selectedActivity: prevState.selectedActivity || defaultActivity.name
	};
};

class TimeEntryContainer extends React.Component {
	constructor(props) {
		super(props);

		this.handleDateChange = this.handleDateChange.bind(this);

		this.state = {
			selectedDate: null,
			selectedEntry: {},
			selectedPhase: '',
			selectedActivity: '',
			defaultPhase: '',
			defaultActivity: '',
			activitiesMap: new Map(),
			phases: []
		};
	}

	componentWillMount() {
		if (!this.props.phasesQuery.loading &&
				!this.props.phasesQuery.error) {
			this.setState(_handlePhasesQueryUpdate);
		}

		if (!this.props.dayDetailsQuery.loading &&
				!this.props.dayDetailsQuery.error) {
			this.setState(_handleDayDetailsQueryUpdate);
		}

		if (!this.props.allEntriesQuery.loading &&
				!this.props.allEntriesQuery.error) {
			this.setState(_handleDateChange(moment()));
		}
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.phasesQuery.loading &&
				!nextProps.phasesQuery.loading &&
				!nextProps.phasesQuery.error) {
			this.setState(_handlePhasesQueryUpdate);
		}

		if (this.props.dayDetailsQuery.loading &&
				!nextProps.dayDetailsQuery.loading &&
				!nextProps.dayDetailsQuery.error) {
			this.setState(_handleDayDetailsQueryUpdate);
		}

		if (this.props.allEntriesQuery.loading &&
				!nextProps.allEntriesQuery.loading &&
				!nextProps.allEntriesQuery.error &&
				!this.state.selectedDate) {
			this.setState(_handleDateChange(moment()));
		}
	}

	handleDateChange(date) {
		this.props.dayDetailsQuery.refetch({ date: date.format('YYYY-MM-DD') });

		this.setState(_handleDateChange(date));
	}

	render() {
		const {
			selectedDate,
			selectedEntry,
			selectedPhase,
			selectedActivity,
			phases,
			activitiesMap
		} = this.state;

		const {
			entries
		} = this.props.allEntriesQuery.allEntries || { entries: [{}] };

		const activities = activitiesMap.get(selectedPhase) || [];

		return (<TimeEntry
			entries={entries}
			selectedDate={selectedDate ? moment(selectedDate) : null}
			selectedEntry={selectedEntry}
			selectedPhase={selectedPhase}
			selectedActivity={selectedActivity}
			phases={phases}
			activities={activities}
			onDateChange={this.handleDateChange}
			isSpecialCase={_isSpecialCases(activities, selectedActivity)}
			statistics={selectedEntry ? _getStatistics(selectedDate, selectedEntry) : {}}
		/>);
	}
}

export default compose(
	graphql(queries.projectPhases, { name: 'phasesQuery' }),
	graphql(queries.allEntries, { name: 'allEntriesQuery' }),
	graphql(queries.dayDetailsQuery, {
		name: 'dayDetailsQuery',
		options: {
			variables: {
				date: moment().format('YYYY-MM-DD')
			}
		}
	})
)(TimeEntryContainer);

TimeEntryContainer.propTypes = {
	allEntriesQuery: AllEntriesQuery.isRequired,
	phasesQuery: PhasesQuery.isRequired,
	dayDetailsQuery: DayDetailsQuery.isRequired
};
