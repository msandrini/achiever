import React from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import PropTypes from 'prop-types';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';

import 'react-datepicker/dist/react-datepicker.css';

import TimeGroup from './edit/TimeGroup';
import {
	STORAGEDAYKEY,
	STORAGEKEY,
	setTodayStorage,
	getTodayStorage,
	timeIsValid,
	areTheSameDay,
	replacingValueInsideArray
} from '../../shared/utils';
import strings from '../../shared/strings';

const referenceHours = [9, 12, 13, 17];
const storedTimesIndex = {
	startTime: 0,
	startBreakTime: 1,
	endBreakTime: 2,
	endTime: 3
};

const ADD_TIME_ENTRY_MUTATION = gql`
	mutation addTimeEntry($timeEntry: TimeEntryInput!) {
		addTimeEntry(timeEntry: $timeEntry) {
			date
			employeeName
			startTime
			startBreakTime
			endBreakTime
			endTime
			total
		}
	}
`;

const WEEK_ENTRIES_QUERY = gql`
	query weekEntriesQuery($date: String!) {
		weekEntries(date: $date) {
			timeEntries {
				date
				startTime
				startBreakTime
				endBreakTime
				endTime
				total
			}
			total
		}
		userDetails {
			dailyContractedHours
			balance
		}
	}
`;

class Edit extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			controlDate: moment(),
			labouredHoursOnDay: null,
			remainingHoursOnWeek: null,
			storedTimes: [{}, {}, {}, {}],
			focusedField: null,
			shouldHaveFocus: null
		};
		this.onDateChange = this.onDateChange.bind(this);
		this.onTimeSet = this.onTimeSet.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
		this.imReligious = this.imReligious.bind(this);

		this.submitButton = null;
	}

	componentWillMount() {
		this.setState({ storedTimes: getTodayStorage(STORAGEKEY, STORAGEDAYKEY) });
	}

	componentWillReceiveProps(nextProps) {
		const { loading, error, weekEntries } = nextProps.weekEntriesQuery;

		if (this.props.weekEntriesQuery.loading && !loading && !error) {
			this.setState({ remainingHoursOnWeek: weekEntries.total });
		}
	}

	onDateChange(date) {
		const oldSelectedDate = this.state.controlDate;
		const sameWeek = oldSelectedDate.week() === date.week();
		this.setState({
			controlDate: date
		});

		if (!sameWeek) {
			this._fetchWeekEntries(date);
		}

		this._checkPreEnteredValues(date);
	}

	onTimeSet(groupIndex) {
		return (hours, minutes) => {
			const composedTime = { hours, minutes };
			this.setState((prevState) => {
				const newState = {
					...prevState,
					storedTimes: replacingValueInsideArray(
						prevState.storedTimes,
						groupIndex,
						composedTime
					)
				};
				if (areTheSameDay(prevState.controlDate, moment())) {
					setTodayStorage(STORAGEKEY, STORAGEDAYKEY, newState.storedTimes);
				}
				return newState;
			});
			if (this.state.focusedField) {
				const modeBeingChanged = this.state.focusedField.fieldMode;
				const valueBeingChanged = composedTime[modeBeingChanged];

				if (String(valueBeingChanged).length === 2) {
					const nextField = this._getNextField();
					this.setState({
						shouldHaveFocus: nextField
					});
				} else {
					this.setState({
						shouldHaveFocus: false
					});
				}
			}

		};
	}

	onFieldFocus(index) {
		return (fieldMode) => {
			this.setState({ focusedField: { index, fieldMode } });
		};
	}

	onSubmit(event) {
		event.preventDefault();
		const { controlDate, storedTimes } = this.state;

		const startTime = storedTimes[storedTimesIndex.startTime];
		const startBreakTime = storedTimes[storedTimesIndex.startBreakTime];
		const endBreakTime = storedTimes[storedTimesIndex.endBreakTime];
		const endTime = storedTimes[storedTimesIndex.endTime];

		const timeEntryInput = {
			date: controlDate.format('YYYY-MM-DD'),
			startTime: `${startTime.hours}:${startTime.minutes}`,
			startBreakTime: `${startBreakTime.hours}:${startBreakTime.minutes}`,
			endBreakTime: `${endBreakTime.hours}:${endBreakTime.minutes}`,
			endTime: `${endTime.hours}:${endTime.minutes}`
		};

		this._addTimeEntry(timeEntryInput);
	}

	async _fetchWeekEntries(date) {
		const { refetch } = this.props.weekEntriesQuery;
		const response = await refetch({ date: date.format('YYYY-MM-DD') });
		console.log('New week entries:', response.data.weekEntries);
		this._checkPreEnteredValues(date);
	}

	async _addTimeEntry(timeEntryInput) {
		let response;
		try {
			response = await this.props.addTimeEntry({
				variables: {
					timeEntry: timeEntryInput
				}
			});
		} catch (error) {
			console.error('Time entry failed!', error);
		}

		if (response) {
			console.info('Time entry saved!!!');
			const date = moment(this.state.controlDate);
			await this._fetchWeekEntries(date.format('YYYY-MM-DD'));
		}
	}

	imReligious() {
		this.onTimeSet(0)(8, 15);
		this.onTimeSet(1)(12, 15);
		this.onTimeSet(2)(13, 15);
		this.onTimeSet(3)(17, 15);
	}

	_checkPreEnteredValues(date) {
		if (this.props.weekEntriesQuery.loading || this.props.weekEntriesQuery.error) {
			return;
		}

		const { timeEntries } = this.props.weekEntriesQuery.weekEntries;
		const timeEntry = timeEntries.find(item => item.date === date.format('YYYY-MM-DD'));

		if (timeEntry) {
			const {
				startTime,
				startBreakTime,
				endBreakTime,
				endTime
			} = timeEntry;

			const storedTimes = [
				{
					hours: moment(startTime, 'H:mm').hours(),
					minutes: moment(startTime, 'H:mm').minutes()
				},
				{
					hours: moment(startBreakTime, 'H:mm').hours(),
					minutes: moment(startBreakTime, 'H:mm').minutes()
				},
				{
					hours: moment(endBreakTime, 'H:mm').hours(),
					minutes: moment(endBreakTime, 'H:mm').minutes()
				},
				{
					hours: moment(endTime, 'H:mm').hours(),
					minutes: moment(endTime, 'H:mm').minutes()
				}
			];

			this.setState({ storedTimes });
		}
	}

	_getNextField() {
		const { focusedField } = this.state;
		if (focusedField.fieldMode === 'hours') {
			return {
				index: focusedField.index,
				fieldMode: 'minutes'
			};
		}
		if (focusedField.fieldMode === 'minutes' && focusedField.index === 3) {
			this.submitButton.focus();
			return false;
		}
		return {
			index: focusedField.index + 1,
			fieldMode: 'hours'
		};
	}

	_shouldHaveFocus(index) {
		const { shouldHaveFocus } = this.state;
		if (shouldHaveFocus && shouldHaveFocus.index === index) {
			return shouldHaveFocus.fieldMode;
		}
		return false;
	}

	_shouldSendBeAvailable() {
		let comparisonTerm = 0;
		const isSequentialTime = (time) => {
			if (time && timeIsValid(time)) {
				const date = new Date(2017, 0, 1, time.hours, time.minutes, 0, 0);
				const isLaterThanComparison = date > comparisonTerm;
				comparisonTerm = Number(date);
				return isLaterThanComparison;
			}
			return false;
		};

		return this.state.storedTimes.every(isSequentialTime);
	}

	render() {
		const {
			controlDate,
			labouredHoursOnDay,
			remainingHoursOnWeek,
			storedTimes
		} = this.state;

		return (
			<div className="page-wrapper">
				<h2 className="current-date">
					{strings.dateBeingEdited}:{' '}
					<strong>{controlDate.format('L')}</strong>
				</h2>
				<form onSubmit={this.onSubmit}>
					<div className="column">
						<div className="time-management-content">
							<DatePicker
								inline
								selected={this.state.controlDate}
								onChange={this.onDateChange}
							/>
							<p className="remaining">
								{strings.remainingHoursOnWeek}
								{' '}
								<strong>{remainingHoursOnWeek}</strong>
							</p>
							{ labouredHoursOnDay ?
								(
									<p className="projection">
										{strings.hoursLabouredOnThisDay}
										{' '}
										<strong>{labouredHoursOnDay}</strong>
									</p>
								) : ''
							}
						</div>
					</div>
					<div className="column">
						<div className="time-management-content">
							{referenceHours.map((refHour, index) => (
								<TimeGroup
									key={refHour}
									label={strings.times[index].label}
									emphasis={index === 0 || index === 3}
									referenceHour={refHour}
									time={storedTimes[index] || '00'}
									shouldHaveFocus={this._shouldHaveFocus(index)}
									onSet={this.onTimeSet(index)}
									onFocus={this.onFieldFocus(index)}
								/>
							))}
							<button
								type="submit"
								className="send"
								ref={(button) => { this.submitButton = button; }}
								disabled={!this._shouldSendBeAvailable()}
							>
								{strings.send}
							</button>
							<button
								type="button"
								onClick={this.imReligious}
								className="test"
								style={{ fontSize: '11px' }}
							>
							Test
							</button>
						</div>
					</div>
				</form>
			</div>
		);
	}
}

export default compose(
	graphql(ADD_TIME_ENTRY_MUTATION, { name: 'addTimeEntry' }),
	graphql(WEEK_ENTRIES_QUERY, {
		name: 'weekEntriesQuery',
		options: { variables: { date: moment().format('YYYY-MM-DD') } }
	})
)(Edit);

Edit.propTypes = {
	addTimeEntry: PropTypes.func.isRequired,
	weekEntriesQuery: PropTypes.object.isRequired
};
