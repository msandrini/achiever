import React from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import PropTypes from 'prop-types';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';

import 'react-datepicker/dist/react-datepicker.css';
import '../styles/calendar.styl';

import TimeGroup from './edit/TimeGroup';
import LabouredHoursGauge from './edit/LabouredHoursGauge';
import SelectGroup from './edit/SelectGroup';
import Panel from './ui/Panel';
import PageLoading from './genericPages/PageLoading';

import {
	areTheSameDay,
	getTodayStorage,
	replacingValueInsideArray,
	setTodayStorage,
	storedTimesIndex,
	submitToServer
} from './shared/utils';
import { timeIsValid } from '../../shared/utils';
import strings from '../../shared/strings';

const referenceHours = [9, 12, 13, 17];

const ADD_TIME_ENTRY_MUTATION = gql`
	mutation addTimeEntry($timeEntry: TimeEntryInput!) {
		addTimeEntry(timeEntry: $timeEntry) {
			date
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
				phase
				activity
				startTime
				startBreakTime
				endBreakTime
				endTime
				total
			}
			total
		}
		userDetails {
			name
			dailyContractedHours
			balance
		}
		phases {
			default
			options {
				id
				name
				activities {
					default
					options {
						id
						name
					}
				}
			}
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
	let balanceSign;

	if (hours > 0 || minutes > 0) {
		balanceSign = '-';
	} else if (hours < 0 || minutes < 0) {
		balanceSign = '+';
	} else {
		balanceSign = '';
	}

	if (hours < 0) {
		hoursAsString *= -1;
	}

	if (minutes < 0) {
		minutesAsString *= -1;
	}

	if (minutesAsString < 10) {
		minutesAsString = `0${minutesAsString}`;
	}

	timeAsString += `${balanceSign}${hoursAsString}:${minutesAsString}`;

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
			phase: {
				id: null,
				name: '',
				activities: [],
				default: null
			},
			activity: {
				id: null,
				name: '',
				default: null
			},
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
		this._checkEnteredValues(this.state.controlDate, this.props.weekEntriesQuery);
	}

	componentWillReceiveProps(nextProps) {
		const {
			loading,
			error,
			weekEntries,
			phases
		} = nextProps.weekEntriesQuery;
        
    if (this.props.weekEntriesQuery.loading && !loading && !error) {
			this._checkEnteredValues(this.state.controlDate, nextProps.weekEntriesQuery);

			const phase = phases.options.find(option => option.id === phases.default);
			const { activities } = phase;
			const activity = activities.options.find(option => option.id === activities.default);

			this.setState({
				phase,
				activity
			});
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

		this._checkEnteredValues(date, this.props.weekEntriesQuery);
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
					setTodayStorage({
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
			const { storedTimes, phase, activity } = { ...this.state };
			const date = this.state.controlDate;
			const ret = await submitToServer(date, storedTimes, phase, activity, callback);
			if (ret.successMessage) {
				this.setState({ ...this.state, ...ret, sentToday: true });
				setTodayStorage({ storedTimes, sentToday: true });
				await this._fetchWeekEntries(date);
			} else {
				this.setState(ret);
			}
		};
	}

	_setProjectPhase(phases) {
		return (value) => {
			const phase = phases.find(option => option.id === value.id);

			const { activities } = phase;
			const activity = activities.options.find(option => option.id === activities.default);

			this.setState({
				phase,
				activity
			});
		};
	}

	_setActivity(activities) {
		return (value) => {
			const id = parseInt(value, 10);
			const activity = activities.find(option => option.id === id);

			this.setState({
				activity
			});
		};
	}

	async _fetchWeekEntries(date) {
		const { refetch } = this.props.weekEntriesQuery;
		await refetch({ date: date.format('YYYY-MM-DD') });
		this._checkEnteredValues(date, this.props.weekEntriesQuery);
	}

	imReligious() {
		this.onTimeSet(0)(8, 15);
		this.onTimeSet(1)(12, 15);
		this.onTimeSet(2)(13, 15);
		this.onTimeSet(3)(17, 15);
	}

	_checkEnteredValues(date, weekEntriesQuery) {
		if (weekEntriesQuery.loading) {
			return;
		}

		if (weekEntriesQuery.error) {
			this.setState({ errorMessage: weekEntriesQuery.error });
			return;
		}

		const { timeEntries } = weekEntriesQuery.weekEntries;
		const timeEntry = timeEntries.find(item => item.date === date.format('YYYY-MM-DD'));

		if (timeEntry) {
			const startTime = moment(timeEntry.startTime, 'H:mm');
			const startBreakTime = moment(timeEntry.startBreakTime, 'H:mm');
			const endBreakTime = moment(timeEntry.endBreakTime, 'H:mm');
			const endTime = moment(timeEntry.endTime, 'H:mm');
			const labouredHoursOnDay = timeEntry.total;

			const isToday = areTheSameDay(moment(timeEntry.date), moment());

			// If data is on server
			if (startTime.isValid() &&
				startBreakTime.isValid() &&
				endBreakTime.isValid() &&
				endTime.isValid()
			) {
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
				// If today was fecthed
				if (isToday) {
					setTodayStorage({
						storedTimes,
						sentToday: true
					});
				}
				this.setState({
					storedTimes,
					sentToday: true,
					labouredHoursOnDay
				});
			} else if (isToday) {
				// If today and not in server, use localStorage
				const { storedTimes: localStoredTimes, sentToday } = getTodayStorage();
				this.setState({
					storedTimes: localStoredTimes,
					sentToday,
					labouredHoursOnDay: (isValid(localStoredTimes) && calculateLabouredHours(localStoredTimes)) || ''
				});
			} else {
				// If not today should do something... for now, just set state empty
				this.setState({
					storedTimes: [{}, {}, {}, {}],
					labouredHoursOnDay
				});
			}

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

	_getWeekEntriesQuerySafe(object = 'weekEntries') {
		return (this.props.weekEntriesQuery && this.props.weekEntriesQuery[object]) || {};
	}

	_getHighlightedDates() {
		const highlights = [
			{ 'calendar-checked': [] },
			{ 'calendar-unchecked': [] }
		];
		const weekEntriesQuery = this._getWeekEntriesQuerySafe();
		if (!weekEntriesQuery.timeEntries) {
			return highlights;
		}
		const weekDayNumbers = [1, 2, 3, 4, 5];
		weekDayNumbers.forEach((day) => {
			const dayInfo = weekEntriesQuery.timeEntries[day];
			const elementToPush = dayInfo.total ?
				highlights[0]['calendar-checked'] :
				highlights[1]['calendar-unchecked'];

			elementToPush.push(moment(dayInfo.date));
		});
		return highlights;
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
			storedTimes,
			phase,
			activity
		} = this.state;

		const userDetails = this._getWeekEntriesQuerySafe('userDetails');
		const { dailyContractedHours } = userDetails;
		const phases = this._getWeekEntriesQuerySafe('phases');

		return (
			<div className="page-wrapper">
				<PageLoading
					active={this.props.weekEntriesQuery.loading}
				/>;
				<h2 className="current-date">
					{strings.dateBeingEdited}:{' '}
					<strong>{controlDate.format('L')}</strong>
				</h2>
				<form onSubmit={this.onSubmit(this.props.addTimeEntry)}>
					<div className="column">
						<div className="time-management-content">
							<DatePicker
								inline
								highlightDates={this._getHighlightedDates()}
								selected={this.state.controlDate}
								onChange={this.onDateChange}
							/>
							{ labouredHoursOnDay ?
								(
									<LabouredHoursGauge
										entitledHours={dailyContractedHours}
										labouredHours={labouredHoursOnDay}
									>
										{strings.hoursLabouredOnThisDay}
										{' '}
										<strong>{labouredHoursOnDay}</strong>
									</LabouredHoursGauge>
								) : ''
							}
							<p className="remaining">
								{strings.remainingHoursOnWeek}
								{' '}
								<strong>{remainingHoursOnWeek}</strong>
							</p>
						</div>
					</div>
					<div className="column">
						<div className="time-management-content">
							<Panel message={this.state.successMessage} type="success" />
							<Panel message={this.state.errorMessage} type="error" />
							<SelectGroup
								name="projectPhase"
								label={strings.projectPhase}
								options={phases.options}
								selected={phase.id}
								onChange={this._setProjectPhase(phases.options)}
							/>
							<SelectGroup
								name="activity"
								label={strings.activity}
								options={phase.activities.options}
								selected={activity.id}
								onChange={this._setActivity(phase.activities.options)}
							/>
							{referenceHours.map((refHour, index) => (
								<TimeGroup
									key={refHour}
									label={strings.times[index].label}
									emphasis={index === 0 || index === 3}
									tabIndexes={index * 2}
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
