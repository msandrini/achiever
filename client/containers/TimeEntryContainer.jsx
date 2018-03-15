import React from 'react';
import { graphql, compose } from 'react-apollo';
import moment from 'moment';

import TimeEntry from '../components/timeEntry/TimeEntry';
import * as queries from '../queries.graphql';
import {
	AllEntriesQuery,
	PhasesQuery
} from '../PropTypes';

class TimeEntryContainer extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedDate: moment(),
			selectedEntry: null,
			activites: null
		};
	}

	render() {
		const {
			timeData
		} = this.props.allEntriesQuery.allEntries || { timeData: [{}] };

		const selectedEntry = this.state.selectedEntry ||
			timeData.find(data =>
				data.date === this.state.selectedDate.format('YYYY-MM-DD')) || {};

		const activities = this.state.activites ||
			this.props.phasesQuery.phases ?
			this.props.phasesQuery.phases.options[0].activities :
			{};

		return (<TimeEntry
			entries={timeData}
			selectedDate={this.state.selectedDate}
			selectedEntry={selectedEntry}
			phases={this.props.phasesQuery.phases}
			activities={activities}
		/>);
	}
}

export default compose(
	graphql(queries.projectPhases, { name: 'phasesQuery' }),
	graphql(queries.allEntries, { name: 'allEntriesQuery' }),
)(TimeEntryContainer);

TimeEntryContainer.propTypes = {
	allEntriesQuery: AllEntriesQuery.isRequired,
	phasesQuery: PhasesQuery.isRequired
};
