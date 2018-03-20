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
	selectedDate: date.format('YYYY-MM-DD'),
	entry: {}
});

const _recalculateBalance = (entry, persisted) => {
	const DEFAULT_TIME = '0:00';

	const {
		startTime,
		startBreakTime,
		endBreakTime,
		endTime
	} = entry;

	const total = new TimeDuration(endTime || DEFAULT_TIME);
	total.subtract(startTime || DEFAULT_TIME);
	total.subtract(endBreakTime || DEFAULT_TIME);
	total.add(startBreakTime || DEFAULT_TIME);

	const difference = new TimeDuration(total);
	difference.subtract(persisted.total || DEFAULT_TIME);

	const weekBalance = new TimeDuration(persisted.weekBalance || DEFAULT_TIME);
	weekBalance.add(difference);

	const balance = new TimeDuration(persisted.balance || DEFAULT_TIME);
	balance.add(difference);

	return {
		...entry,
		total: total.toString(),
		weekBalance: weekBalance.toString(),
		balance: balance.toString()
	};
};

const _handleEntryChange = (entries, entry) => () => {
	const persisted = entries.find(item => item.date === entry.date);

	return {
		entry: _recalculateBalance(entry, persisted)
	};
};

class TimeEntryContainer extends React.Component {
	constructor(props) {
		super(props);

		this.handleDateChange = this.handleDateChange.bind(this);
		this.handleEntryChange = this.handleEntryChange.bind(this);

		this.state = {
			selectedDate: null,
			entry: {}
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

	handleEntryChange(entries) {
		return (entry) => {
			this.setState(_handleEntryChange(entries, entry));
		};
	}

	render() {
		const {
			selectedDate,
			entry
		} = this.state;

		const {
			entries
		} = this.props.allEntriesQuery.allEntries || { entries: [{}] };

		const persisted = entries.find(data => data.date === selectedDate);
		const selectedEntry = { ...persisted, ...entry };

		return (<TimeEntry
			entries={entries}
			selectedDate={selectedDate ? moment(selectedDate) : null}
			selectedEntry={selectedEntry}
			onDateChange={this.handleDateChange}
			onChangeEntry={this.handleEntryChange(entries)}
			statistics={selectedEntry ? _getStatistics(selectedDate, selectedEntry) : {}}
		/>);
	}
}

export default compose(graphql(queries.allEntries, { name: 'allEntriesQuery' }))(TimeEntryContainer);

TimeEntryContainer.propTypes = {
	allEntriesQuery: AllEntriesQuery.isRequired
};
