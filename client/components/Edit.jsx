import React from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import PropTypes from 'prop-types';
import { graphql, compose } from 'react-apollo';
import 'react-datepicker/dist/react-datepicker.css';

import * as queries from '../queries.graphql';
import TimeGroup from './edit/TimeGroup';
import LabouredHoursGauge from './edit/LabouredHoursGauge';
import SelectGroup from './edit/SelectGroup';
import WeeklyCalendar from './edit/WeeklyCalendar';
import Panel from './ui/Panel';
import PageLoading from './genericPages/PageLoading';

import {
	areTheSameDay,
	getTodayStorage,
	replacingValueInsideArray,
	setTodayStorage,
	submitToServer,
	calculateLabouredHours,
	calculateRemainingHoursOnWeek,
	timesAreValid,
	dismemberTimeString
} from '../utils';

import strings from '../../shared/strings';

import '../styles/calendar.styl';

const referenceHours = [9, 12, 13, 17];
const SPECIAL_ACTIVITY_HOLIDAY = { id: 99999, name: 'Holiday' };

const _getChosenDateInfoFromWeekInfo = (date, { timeEntries }) =>
	timeEntries.find(item => item.date === date.format('YYYY-MM-DD'));

class Edit extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			controlDate: moment(),
			labouredHoursOnDay: null,
			remainingHoursOnWeek: {},
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
		this._getTimesForChosenDate(this.state.controlDate, this.props.weekEntriesQuery);
	}

	componentWillReceiveProps(nextProps) {
		// If finished (was loading and stopped) loading from server and no errors
		const {
			weekEntriesQuery,
			projectPhasesQuery
		} = nextProps;

		const error = weekEntriesQuery.error || projectPhasesQuery.error;
		if (error) {
			this.setState({ errorMessage: error });
			return;
		}

		if (this.props.weekEntriesQuery.loading && !weekEntriesQuery.loading) {
			this._getTimesForChosenDate(this.state.controlDate, weekEntriesQuery);
			this._setPhaseAndActivityForChosenDate(this.state.controlDate, weekEntriesQuery);
		}
		if (this.props.projectPhasesQuery.loading && !projectPhasesQuery.loading) {
			this._afterFetchingFromServer(projectPhasesQuery.phases);
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

		this._getTimesForChosenDate(date, this.props.weekEntriesQuery);
		this._setPhaseAndActivityForChosenDate(date, this.props.weekEntriesQuery);
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

				const labouredHoursOnDay = (timesAreValid(storedTimes) && calculateLabouredHours(storedTimes)) || '';
				const remainingHoursOnWeek = calculateRemainingHoursOnWeek(
					prevState.controlDate,
					labouredHoursOnDay,
					this.props.userDetailsQuery.dailyContractedHours,
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

			if (activity) {
				this.setState({	activity });
			}
		};
	}

	async _fetchWeekEntries(date) {
		const { refetch } = this.props.weekEntriesQuery;
		await refetch({ date: date.format('YYYY-MM-DD') });
		this._getTimesForChosenDate(date, this.props.weekEntriesQuery);
	}

	imReligious() {
		this.onTimeSet(0)(7, 30);
		this.onTimeSet(1)(11, 30);
		this.onTimeSet(2)(12, 30);
		this.onTimeSet(3)(16, 30);
	}

	_afterFetchingFromServer(projectPhases) {
		// Set queried project phases and activities from server
		const phase = projectPhases.options.find(option => option.id === projectPhases.default);
		const { activities } = phase;
		const activity = activities.options.find(option => option.id === activities.default);

		this.setState({
			phase,
			activity
		});
	}

	_getTimesForChosenDate(chosenDate, weekEntriesQuery) {
		const {
			loading,
			error,
			weekEntries
		} = weekEntriesQuery;

		if (loading || error) {
			return;
		}

		// Now check whether the times are already on server or not
		const dayEntries = _getChosenDateInfoFromWeekInfo(chosenDate, weekEntries);

		if (dayEntries) {
			const startTime = moment(dayEntries.startTime, 'H:mm');
			const endTime = moment(dayEntries.endTime, 'H:mm');
			const labouredHoursOnDay = dayEntries.total;

			const isToday = areTheSameDay(moment(dayEntries.date), moment());

			// If data is on server
			if (startTime.isValid() && endTime.isValid()) {
				const timesAsString = [
					dayEntries.startTime,
					dayEntries.startBreakTime,
					dayEntries.endBreakTime,
					dayEntries.endTime
				];
				const storedTimes = timesAsString.map(timeString =>
					dismemberTimeString(timeString));

				// If today was fetched
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
					labouredHoursOnDay: (timesAreValid(localStoredTimes) &&
						calculateLabouredHours(localStoredTimes)) || ''
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

	_setPhaseAndActivityForChosenDate(chosenDate, weekEntriesQuery) {
		const { weekEntries } = weekEntriesQuery;

		const dayInfo = _getChosenDateInfoFromWeekInfo(chosenDate, weekEntries);
		const activityFromDayData = dayInfo && dayInfo.activity;

		if (this.state.phase.activities.options) {
			const chosenActivity = this.state.phase.activities.options.find(activity =>
				activity.name === activityFromDayData);

			let activity = {};
			if (chosenActivity) {
				activity = chosenActivity;
			} else if (activityFromDayData === SPECIAL_ACTIVITY_HOLIDAY.name) {
				activity = SPECIAL_ACTIVITY_HOLIDAY;
			}
			this.setState({ activity });
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

	_getHighlightedDates() {
		const highlights = [
			{ 'calendar-checked': [] },
			{ 'calendar-unchecked': [] }
		];
		const weekEntriesQuery = this.props.weekEntriesQuery || {};
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
		return timesAreValid(this.state.storedTimes);
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

		const { dailyContractedHours } = this.props.userDetailsQuery.userDetails || {};
		const projectPhases = this.props.projectPhasesQuery.phases || {};

		const showProjectPhaseAsText = projectPhases.options &&
			projectPhases.options.length === 1 ? projectPhases.options[0].name : null;

		const activityOptions = phase.activities.options ? phase.activities.options : [];

		const shouldDisableFields = activity.id === SPECIAL_ACTIVITY_HOLIDAY.id;
		const shouldHideTimeGroup = index => shouldDisableFields &&
			(index === 1 || index === 2);

		return (
			<div className="page-wrapper">
				<PageLoading
					active={this.props.weekEntriesQuery.loading}
				/>
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
							{ remainingHoursOnWeek.remainingTime ?
								(
									<LabouredHoursGauge
										entitledDuration={remainingHoursOnWeek.entitledDuration}
										labouredHours={labouredHoursOnDay}
									>
										{strings.remainingHoursOnWeek}
										{' '}
										<strong>{remainingHoursOnWeek.remainingTime}</strong>
									</LabouredHoursGauge>
								) : ''
							}
						</div>
					</div>
					<div className="column">
						<div className="time-management-content">
							<Panel message={this.state.successMessage} type="success" />
							<Panel message={this.state.errorMessage} type="error" />
							<SelectGroup
								name="projectPhase"
								label={strings.projectPhase}
								options={projectPhases.options}
								selected={phase.id}
								onChange={this._setProjectPhase(projectPhases.options)}
								showTextInstead={showProjectPhaseAsText}
							/>
							<SelectGroup
								name="activity"
								label={strings.activity}
								options={activityOptions}
								selected={activity.id}
								onChange={this._setActivity(phase.activities.options)}
								showTextInstead={shouldDisableFields ?
									SPECIAL_ACTIVITY_HOLIDAY.name : null}
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
									hidden={shouldHideTimeGroup(index)}
									disabled={shouldDisableFields}
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
				<WeeklyCalendar
					controlDate={this.state.controlDate}
					weekEntries={this.props.weekEntriesQuery.weekEntries}
				/>
			</div>
		);
	}
}

export default compose(
	graphql(queries.addTimeEntry, { name: 'addTimeEntry' }),
	graphql(queries.projectPhases, { name: 'projectPhasesQuery' }),
	graphql(queries.userDetails, { name: 'userDetailsQuery' }),
	graphql(queries.weekEntries, {
		name: 'weekEntriesQuery',
		options: {
			variables: {
				date: moment().format('YYYY-MM-DD')
			}
		}
	})
)(Edit);

Edit.propTypes = {
	addTimeEntry: PropTypes.func.isRequired,
	weekEntriesQuery: PropTypes.object.isRequired,
	projectPhasesQuery: PropTypes.object.isRequired,
	userDetailsQuery: PropTypes.object.isRequired
};
