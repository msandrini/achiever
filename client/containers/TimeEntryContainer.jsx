import React from 'react';
import { graphql, compose } from 'react-apollo';
import moment from 'moment';

import TimeEntry from '../components/timeEntry/TimeEntry';
import * as queries from '../queries.graphql';
import {
	AllEntriesQuery,
	PhasesQuery,
	DayDetailsQuery
} from '../PropTypes';

const _changeDate = date => (_, props) => {
	const {
		entries
	} = props.allEntriesQuery.allEntries || { entries: [{}] };

	return {
		selectedDate: date.format('YYYY-MM-DD'),
		selectedEntry: entries.find(data =>
			data.date === date.format('YYYY-MM-DD'))
	};
};

const _handleDayDetailsQueryUpdate = (_, props) => {
	const {
		phase,
		activity
	} = props.dayDetailsQuery.dayDetails || {};

	return {
		selectedPhase: phase,
		selectedActivity: activity
	};
};

const _handlePhasesQueryUpdate = (_, props) => {
	const { phases } = props.phasesQuery;
	const reducer = (dictionary, phase) => {
		dictionary.set(phase.name, phase.activities.options.map(activity => activity.name));
		return dictionary;
	};
	const activities = phases.options.reduce(reducer, new Map());

	const defaultPhase = phases.options.find(item => item.id === phases.default);
	const defaultActivity = defaultPhase.activities.options
		.find(item => item.id === defaultPhase.activities.default);

	return {
		phases: phases.options.map(phase => phase.name),
		activities,
		defaultPhase: defaultPhase.name,
		defaultActivity: defaultActivity.name
	};
};

class TimeEntryContainer extends React.Component {
	constructor(props) {
		super(props);

		this.handleDateChange = this.handleDateChange.bind(this);

		this.state = {
			selectedDate: moment().format('YYYY-MM-DD'),
			selectedEntry: null,
			selectedPhase: null,
			selectedActivity: null,
			defaultPhase: null,
			defaultActivity: null,
			activities: new Map(),
			phases: []
		};
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
	}

	handleDateChange(date) {
		this.props.dayDetailsQuery.refetch({ date: date.format('YYYY-MM-DD') });

		this.setState(_changeDate(date));
	}

	render() {
		const {
			selectedDate,
			selectedEntry,
			selectedPhase,
			selectedActivity,
			phases,
			activities,
			defaultPhase,
			defaultActivity
		} = this.state;

		const {
			entries
		} = this.props.allEntriesQuery.allEntries || { entries: [{}] };

		return (<TimeEntry
			entries={entries}
			selectedDate={moment(selectedDate)}
			selectedEntry={
				selectedEntry ||
					entries.find(data => data.date === selectedDate) || {}
			}
			selectedPhase={selectedPhase || defaultPhase}
			selectedActivity={selectedActivity || defaultActivity}
			phases={phases}
			activities={activities.get(selectedPhase || defaultPhase) || []}
			onDateChange={this.handleDateChange}
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
