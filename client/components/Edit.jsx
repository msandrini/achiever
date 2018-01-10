import React from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import PropTypes from 'prop-types';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';

import 'react-datepicker/dist/react-datepicker.css';

import TimeGroup from './edit/TimeGroup';
import Panel from './ui/Panel';
import {
	STORAGEDAYKEY,
	STORAGEKEY,
	storedTimesIndex,
	setTodayStorage,
	getTodayStorage,
	areTheSameDay,
	replacingValueInsideArray,
	submitToServer
} from './shared/utils';
import { timeIsValid } from '../../shared/utils';
import strings from '../../shared/strings';

const referenceHours = [9, 12, 13, 17];

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

const calculateLabouredHours = (storedTimes) => {
	const startTime = storedTimes[storedTimesIndex.startTime];
	const startBreakTime = storedTimes[storedTimesIndex.startBreakTime];
	const endBreakTime = storedTimes[storedTimesIndex.endBreakTime];
	const endTime = storedTimes[storedTimesIndex.endTime];

	const labouredHoursOnDay = moment().startOf('day');
	labouredHoursOnDay.add({
		hours: endTime.hours,
		minutes: endTime.minutes
	});
	labouredHoursOnDay.subtract({
		hours: startTime.hours,
		minutes: startTime.minutes
	});
	labouredHoursOnDay.add({
		hours: startBreakTime.hours,
		minutes: startBreakTime.minutes
	});
	labouredHoursOnDay.subtract({
		hours: endBreakTime.hours,
		minutes: endBreakTime.minutes
	});

	return labouredHoursOnDay.format('H:mm');
};

const stringifyTime = (hours, minutes) => {
	let timeAsString = '';
	let hoursAsString = hours;
	let minutesAsString = minutes;

	if (hoursAsString < 0) {
		timeAsString = '-';
		hoursAsString *= -1;
	}
	if (minutesAsString < 0) {
		timeAsString = '-';
		minutesAsString *= -1;
	}

	if (minutesAsString < 10) {
		minutesAsString = `0${minutesAsString}`;
	}

	timeAsString += `${hoursAsString}:${minutesAsString}`;

	return timeAsString;
};

const calculateRemainingHoursOnWeek = (date, workedTime, contractedHours, totalWeek) => {
	const businessDay = date.day() > 5 ? 5 : date.day();

	const dailyContractedDuration = moment.duration(contractedHours);

	const expectedDuration = moment.duration().add({
		hours: dailyContractedDuration.hours() * businessDay,
		minutes: dailyContractedDuration.minutes() * businessDay
	});

	expectedDuration.subtract({
		hours: totalWeek.split(':')[0],
		minutes: totalWeek.split(':')[1]
	});

	const labouredHoursDuration = moment.duration(workedTime);
	expectedDuration.subtract({
		hours: labouredHoursDuration.hours(),
		minutes: labouredHoursDuration.minutes()
	});

	const totalHours = (expectedDuration.days() * 24) + expectedDuration.hours();
	const totalMinutes = expectedDuration.minutes();
	return stringifyTime(totalHours, totalMinutes);
};

const isValid = (storedTimes) => {
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

	return storedTimes.every(isSequentialTime);
};

class Edit extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			controlDate: moment(),
			labouredHoursOnDay: null,
			remainingHoursOnWeek: null,
			storedTimes: [{}, {}, {}, {}],
			focusedField: null,
			shouldHaveFocus: null,
			sentToday: false,
			errorMessage: '',
			successMessage: ''
		};
		this.onDateChange = this.onDateChange.bind(this);
		this.onTimeSet = this.onTimeSet.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
		this.imReligious = this.imReligious.bind(this);

		this.submitButton = null;
	}

	componentWillMount() {
		const { storedTimes, sentToday } = getTodayStorage(STORAGEKEY, STORAGEDAYKEY);
		this.setState({ storedTimes, sentToday });
	}

	componentWillReceiveProps(nextProps) {
		const { loading, error, weekEntries } = nextProps.weekEntriesQuery;

		if (this.props.weekEntriesQuery.loading && !loading && !error) {
			const remainingHoursOnWeek = weekEntries.total;
			this.setState({ remainingHoursOnWeek });
		}
	}

	onDateChange(date) {
		const oldSelectedDate = this.state.controlDate;
		const sameWeek = oldSelectedDate.week() === date.week();
		this.setState({
			controlDate: date,
			errorMessage: '',
			successMessage: ''
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
				const storedTimes = replacingValueInsideArray(
					prevState.storedTimes,
					groupIndex,
					composedTime
				);

				const labouredHoursOnDay = (isValid(storedTimes) && calculateLabouredHours(storedTimes)) || '';
				const remainingHoursOnWeek = calculateRemainingHoursOnWeek(
					prevState.controlDate,
					labouredHoursOnDay,
					this.props.weekEntriesQuery.userDetails.dailyContractedHours,
					this.props.weekEntriesQuery.weekEntries.total
				);

				const newState = {
					...prevState,
					storedTimes,
					labouredHoursOnDay,
					remainingHoursOnWeek
				};

				if (areTheSameDay(prevState.controlDate, moment())) {
					setTodayStorage(STORAGEKEY, STORAGEDAYKEY, {
						storedTimes: newState.storedTimes,
						sentToday: newState.sentToday
					});
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

	onSubmit(callback) {
		return async (event) => {
			event.preventDefault();
			const { storedTimes } = { ...this.state };
			const ret = await submitToServer(storedTimes, callback);
			if (ret.successMessage) {
				const date = moment(this.state.controlDate);
				this.setState({ ...this.state, ...ret, sentToday: true });
				setTodayStorage(STORAGEKEY, STORAGEDAYKEY, { storedTimes, sentToday: true });
				await this._fetchWeekEntries(date);
			} else {
				this.setState(ret);
			}
		};
	}

	async _fetchWeekEntries(date) {
		const { refetch } = this.props.weekEntriesQuery;
		await refetch({ date: date.format('YYYY-MM-DD') });
		this._checkPreEnteredValues(date);
	}

	imReligious() {
		this.onTimeSet(0)(8, 15);
		this.onTimeSet(1)(12, 15);
		this.onTimeSet(2)(13, 15);
		this.onTimeSet(3)(17, 15);
	}

	_checkPreEnteredValues(date) {
		if (this.props.weekEntriesQuery.loading) {
			return;
		}

		if (this.props.weekEntriesQuery.error) {
			this.setState({ errorMessage: this.props.weekEntriesQuery.error });
			return;
		}

		const { timeEntries } = this.props.weekEntriesQuery.weekEntries;
		const timeEntry = timeEntries.find(item => item.date === date.format('YYYY-MM-DD'));

		if (timeEntry) {
			const startTime = moment(timeEntry.startTime, 'H:mm');
			const startBreakTime = moment(timeEntry.startBreakTime, 'H:mm');
			const endBreakTime = moment(timeEntry.endBreakTime, 'H:mm');
			const endTime = moment(timeEntry.endTime, 'H:mm');
			const labouredHoursOnDay = timeEntry.total;

			const storedTimes = [
				{
					hours: startTime.hours(),
					minutes: startTime.minutes()
				},
				{
					hours: startBreakTime.hours(),
					minutes: startBreakTime.minutes()
				},
				{
					hours: endBreakTime.hours(),
					minutes: endBreakTime.minutes()
				},
				{
					hours: endTime.hours(),
					minutes: endTime.minutes()
				}
			];

			this.setState({ storedTimes, labouredHoursOnDay });
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
		return isValid(this.state.storedTimes);
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
				<form onSubmit={this.onSubmit(this.props.addTimeEntry)}>
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
							<Panel message={this.state.successMessage} type="success" />
							<Panel message={this.state.errorMessage} type="error" />
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
