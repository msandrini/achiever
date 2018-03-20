import React from 'react';
import { graphql, compose } from 'react-apollo';
import moment from 'moment';
import TimeDuration from 'time-duration';

import TimeEntry from '../components/timeEntry/TimeEntry';
import * as queries from '../queries.graphql';
import { AllEntriesQuery } from '../PropTypes';

const _numberfyTime = value => (new TimeDuration(value)).toMinutes();

const _getStatistics = (selectedDate, entry) => ({
	dayBalance: _numberfyTime(entry.total),
	weekBalance: _numberfyTime(entry.weekBalance),
	totalBalance: _numberfyTime(entry.balance),
	contractedTime: _numberfyTime(entry.contractedTime),
	weekDay: moment(selectedDate).isoWeekday()
});

const _handleDateChange = date => () => ({
	selectedDate: date.format('YYYY-MM-DD')
});

class TimeEntryContainer extends React.Component {
	constructor(props) {
		super(props);

		this.handleDateChange = this.handleDateChange.bind(this);

		this.state = {
			selectedDate: null
		};
	}

	componentWillMount() {
		if (!this.props.allEntriesQuery.loading &&
				!this.props.allEntriesQuery.error) {
			this.setState(_handleDateChange(moment()));
		}
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.allEntriesQuery.loading &&
				!nextProps.allEntriesQuery.loading &&
				!nextProps.allEntriesQuery.error &&
				!this.state.selectedDate) {
			this.setState(_handleDateChange(moment()));
		}
	}

	handleDateChange(date) {
		this.setState(_handleDateChange(date));
	}

	render() {
		const {
			selectedDate
		} = this.state;

		const {
			entries
		} = this.props.allEntriesQuery.allEntries || { entries: [{}] };

		const selectedEntry = entries.find(data => data.date === selectedDate);

		return (<TimeEntry
			entries={entries}
			selectedDate={selectedDate ? moment(selectedDate) : null}
			selectedEntry={selectedEntry}
			onDateChange={this.handleDateChange}
			statistics={selectedEntry ? _getStatistics(selectedDate, selectedEntry) : {}}
		/>);
	}
}

export default compose(graphql(queries.allEntries, { name: 'allEntriesQuery' }))(TimeEntryContainer);

TimeEntryContainer.propTypes = {
	allEntriesQuery: AllEntriesQuery.isRequired
};
