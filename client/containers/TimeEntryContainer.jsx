import React from 'react';
import PropTypes from 'prop-types';
import { graphql, compose } from 'react-apollo';
import moment from 'moment';
import TimeDuration from 'time-duration';

import TimeEntry from '../components/timeEntry/TimeEntry';
import strings from '../../shared/strings';
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
	entry: {},
	successMessage: null,
	errorMessage: null
});

const _handleModeChange = mode => () => ({ mode });

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
		this.handleModeChange = this.handleModeChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);

		this.state = {
			selectedDate: null,
			entry: {},
			successMessage: null,
			errorMessage: null,
			mode: ''
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

	handleModeChange(modeSelected) {
		this.setState(_handleModeChange(modeSelected));
	}

	handleSubmit(event) {
		event.preventDefault();
		if (!this.state.entry) {
			return;
		}

		const {
			date,
			startTime,
			endTime,
			startBreakTime,
			endBreakTime
		} = this.state.entry;

		const {
			entries
		} = this.props.allEntriesQuery.allEntries || { entries: [{}] };

		const persisted = entries.find(data => data.date === date);
		const isPersisted = Boolean(persisted && persisted.total !== '0:00');

		const mutate = isPersisted ?
			this.props.updateTimeEntryMutation :
			this.props.addTimeEntryMutation;

		mutate({
			variables: {
				timeEntry: {
					date,
					startTime,
					endTime,
					startBreakTime,
					endBreakTime
				}
			}
		}).then(() => {
			this.props.allEntriesQuery.refetch();
			this.setState({ successMessage: strings.submitTimeSuccess });
		}).catch((error) => {
			this.setState({ errorMessage: error.graphQLErrors[0].message });
		});
	}

	render() {
		const {
			selectedDate,
			entry,
			mode,
			successMessage,
			errorMessage
		} = this.state;

		const {
			entries
		} = this.props.allEntriesQuery.allEntries || { entries: [{}] };

		const persisted = entries.find(data => data.date === selectedDate);
		const isPersisted = Boolean(persisted && persisted.total !== '0:00');
		const selectedEntry = { ...persisted, ...entry };

		return (
			<TimeEntry
				entries={entries}
				mode={mode}
				selectedDate={selectedDate ? moment(selectedDate) : null}
				selectedEntry={selectedEntry}
				statistics={selectedEntry ? _getStatistics(selectedDate, selectedEntry) : {}}
				successMessage={successMessage}
				errorMessage={errorMessage}
				isPersisted={isPersisted}
				isLoading={this.props.allEntriesQuery.loading}
				onDateChange={this.handleDateChange}
				onChangeMode={this.handleModeChange}
				onChangeEntry={this.handleEntryChange(entries)}
				onSubmit={this.handleSubmit}
			/>
		);
	}
}

export default compose(
	graphql(queries.addTimeEntry, { name: 'addTimeEntryMutation' }),
	graphql(queries.updateTimeEntry, { name: 'updateTimeEntryMutation' }),
	graphql(queries.allEntries, { name: 'allEntriesQuery' })
)(TimeEntryContainer);

TimeEntryContainer.propTypes = {
	addTimeEntryMutation: PropTypes.func,
	updateTimeEntryMutation: PropTypes.func,
	allEntriesQuery: AllEntriesQuery
};

TimeEntryContainer.defaultProps = {
	addTimeEntryMutation: () => {},
	updateTimeEntryMutation: () => {},
	allEntriesQuery: {
		allEntries: {
			admission: '',
			name: '',
			entries: []
		},
		error: '',
		loading: false
	}
};
