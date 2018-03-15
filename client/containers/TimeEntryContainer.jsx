import React from 'react';
import { graphql, compose } from 'react-apollo';
import moment from 'moment';

import TimeEntry from '../components/timeEntry/TimeEntry';
import * as queries from '../queries.graphql';
import {
	AllEntriesQuery,
	PhasesQuery
} from '../PropTypes';

const _changeDate = (timeData, date) => () => ({
	selectedDate: date.format('YYYY-MM-DD'),
	selectedEntry: timeData.find(data =>
		data.date === date.format('YYYY-MM-DD'))
});

class TimeEntryContainer extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedDate: moment().format('YYYY-MM-DD'),
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
				data.date === this.state.selectedDate) || {};

		const activities = this.state.activites ||
			this.props.phasesQuery.phases ?
			this.props.phasesQuery.phases.options[0].activities :
			{};

		return (<TimeEntry
			entries={timeData}
			selectedDate={moment(this.state.selectedDate)}
			selectedEntry={selectedEntry}
			phases={this.props.phasesQuery.phases}
			activities={activities}
			onDateChange={date => this.setState(_changeDate(timeData, date))}
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
