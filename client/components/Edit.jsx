import React from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import PropTypes from 'prop-types';
import { graphql, compose } from 'react-apollo';
import 'react-datepicker/dist/react-datepicker.css';
import TimeDuration from 'time-duration';

import * as queries from '../queries.graphql';
import TimeGroup from './edit/TimeGroup';
import LabourStatistics from './edit/LabourStatistics';
import SelectGroup from './edit/SelectGroup';
import WeeklyCalendar from './edit/WeeklyCalendar';
import Panel from './ui/Panel';
import AlertModal from './ui/modals/AlertModal';
import PageLoading from './genericPages/PageLoading';

import {
	areTheSameDay,
	getTodayStorage,
	replacingValueInsideArray,
	setTodayStorage,
	submitToServer,
	calculateLabouredHours,
	calculateHoursBalanceUpToDate,
	timesAreValid,
	dismemberTimeString,
	isDayBlockedInPast,
	isDayAfterToday
} from '../utils';

import strings from '../../shared/strings';

import '../styles/calendar.styl';

const referenceHours = [9, 12, 13, 17];
const START_TABINDEX = 0;
const CTA_TABINDEX = 10;
const SPECIAL_ACTIVITY_HOLIDAY = { id: 99999, name: 'Holiday' };

const _getChosenDateInfoFromWeekInfo = (date, { timeEntries }) =>
	timeEntries.find(item => item.date === date.format('YYYY-MM-DD'));

class Edit extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			controlDate: moment(),
			controlDateIsValid: true,
			calendarDayStyles: [],
			labouredHoursOnDay: null,
			hoursBalanceUpToDate: {},
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
			successMessage: '',
			alertMessage: null
		};

		this.onDateChange = this.onDateChange.bind(this);
		this.onTimeSet = this.onTimeSet.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
		this.imReligious = this.imReligious.bind(this);
		this.onAlertClose = this.onAlertClose.bind(this);
		this._getHoursBalanceValues = this._getHoursBalanceValues.bind(this);
		this._calculateTotalHoursBalance = this._calculateTotalHoursBalance.bind(this);
		this._isControlDatePersisted = this._isControlDatePersisted.bind(this);

		this.submitButton = null;
	}

	componentWillMount() {
		this.onDateChange(this.state.controlDate);
	}

	componentWillReceiveProps(nextProps) {
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
			this._setTimesForChosenDate(this.state.controlDate, weekEntriesQuery);
			this._setPhaseAndActivityForChosenDate(this.state.controlDate, weekEntriesQuery);
			this._getStyleClassForCalendarDays(weekEntriesQuery.weekEntries);
		}
		if (this.props.projectPhasesQuery.loading && !projectPhasesQuery.loading) {
			this._populateProjectPhaseAndActivity(projectPhasesQuery.phases);
		}
	}

	onDateChange(date) {
		if (isDayAfterToday(date)) {
			this.setState({ alertMessage: strings.cannotSelectFutureTime });
			return;
		}
		const {
			weekEntriesQuery,
			projectPhasesQuery
		} = this.props;

		const oldSelectedDate = this.state.controlDate;
		const sameWeek = oldSelectedDate.week() === date.week();
		const controlDateIsValid = !isDayBlockedInPast(date) && !isDayAfterToday(date);
		this.setState({
			controlDate: date,
			controlDateIsValid,
			errorMessage: '',
			successMessage: ''
		});

		if (!sameWeek) {
			this._fetchWeekEntries(date);
		}

		this._setTimesForChosenDate(date, weekEntriesQuery);
		if (weekEntriesQuery.weekEntries) {
			this._populateProjectPhaseAndActivity(projectPhasesQuery.phases);
			this._getStyleClassForCalendarDays(weekEntriesQuery.weekEntries);
		}
	}

	onTimeSet(groupIndex) {
		return (hours = 0, minutes = 0) => {
			const composedTime = { hours, minutes };

			this.setState((prevState) => {
				const storedTimes = replacingValueInsideArray(
					prevState.storedTimes,
					groupIndex,
					composedTime
				);

				const labouredHoursOnDay = (timesAreValid(storedTimes) &&
					calculateLabouredHours(storedTimes)) || '';

				const paramsToSend = {
					contractedHoursForADay: this.props.userDetailsQuery.userDetails.dailyContractedHours,
					labouredHoursOnDay,
					timeEntries: this.props.weekEntriesQuery.weekEntries.timeEntries
				};
				const hoursBalanceUpToDate = calculateHoursBalanceUpToDate(
					prevState.controlDate,
					paramsToSend
				);

				const newState = {
					...prevState,
					storedTimes,
					labouredHoursOnDay,
					hoursBalanceUpToDate
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

	onAlertClose() {
		this.setState({ alertMessage: null });
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
		this._setTimesForChosenDate(date, this.props.weekEntriesQuery);
	}

	imReligious() {
		this.onTimeSet(0)(7, 30);
		this.onTimeSet(1)(11, 30);
		this.onTimeSet(2)(12, 30);
		this.onTimeSet(3)(16, 30);
	}

	_populateProjectPhaseAndActivity(projectPhases) {
		// Set queried project phases and activities from server
		const phase = projectPhases.options.find(option => option.id === projectPhases.default);
		const { activities } = phase;
		const activity = activities.options.find(option => option.id === activities.default);

		this.setState({
			phase,
			activity
		});
	}

	_setTimesForChosenDate(chosenDate, weekEntriesQuery) {
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
			const hoursBalanceUpToDate = this._getHoursBalanceValues(
				chosenDate,
				labouredHoursOnDay,
				weekEntriesQuery
			);

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
					labouredHoursOnDay,
					hoursBalanceUpToDate
				});
			} else if (isToday) {
				// If today and not in server, use localStorage
				const { storedTimes: localStoredTimes, sentToday } = getTodayStorage();
				this.setState({
					storedTimes: localStoredTimes,
					sentToday,
					labouredHoursOnDay: (timesAreValid(localStoredTimes) &&
						calculateLabouredHours(localStoredTimes)) || '',
					hoursBalanceUpToDate
				});
			} else {
				// If not today should do something... for now, just set state empty
				this.setState({
					storedTimes: [{}, {}, {}, {}],
					labouredHoursOnDay,
					hoursBalanceUpToDate
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

			let activityToSend = {};
			if (chosenActivity) {
				activityToSend = chosenActivity;
			} else if (activityFromDayData === SPECIAL_ACTIVITY_HOLIDAY.name) {
				activityToSend = SPECIAL_ACTIVITY_HOLIDAY;
			} else {
				const defaultActivity = this.state.phase.activities.default;
				activityToSend = this.state.phase.activities.options.find(activity =>
					activity.id === defaultActivity);
			}
			this.setState({ activity: activityToSend });
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

	_isControlDatePersisted() {
		const { controlDate } = this.state;
		const { loading, error, weekEntries } = this.props.weekEntriesQuery;

		if (!loading && !error && weekEntries) {
			const persisted = weekEntries.timeEntries
				.find(entry => entry.date === controlDate.format('YYYY-MM-DD'));
			return Boolean(persisted && persisted.total);
		}

		return false;
	}

	_getStyleClassForCalendarDays(weekEntries = {}) {
		const dayStyles = [
			{ 'calendar-checked': [] },
			{ 'calendar-unchecked': [] },
			{ 'calendar-locked': [] },
			{ 'calendar-future-day': [] }
		];
		if (weekEntries.timeEntries) {
			const weekDayNumbers = [1, 2, 3, 4, 5];
			weekDayNumbers.forEach((day) => {
				const dayEntries = weekEntries.timeEntries[day];
				const elementToPush = dayEntries.total ?
					dayStyles[0]['calendar-checked'] :
					dayStyles[1]['calendar-unchecked'];

				const dayMoment = moment(dayEntries.date);

				elementToPush.push(dayMoment);

				if (isDayBlockedInPast(dayMoment)) {
					dayStyles[2]['calendar-locked'].push(dayMoment);
				}
				if (isDayAfterToday(dayMoment)) {
					dayStyles[3]['calendar-future-day'].push(dayMoment);
				}

			});
		}
		this.setState({ calendarDayStyles: dayStyles });
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

	/**
	 * Return state hoursBalanceUpToDate based on weekentries
	 * @param {Object} controlDate is a Moment() of the selected day.
	 * @param {Object} weekEntriesQuery is the fecthed query return.
	 * @return {Object} { contractedHoursUpToDate, labouredHoursUpToDate }.
	 */
	_getHoursBalanceValues(controlDate, labouredHoursOnDay, weekEntriesQuery) {
		const _this = this;
		const hoursBalanceUpToDate = calculateHoursBalanceUpToDate(
			controlDate,
			{
				labouredHoursOnDay,
				contractedHoursForADay: _this.props.userDetailsQuery.userDetails.dailyContractedHours,
				timeEntries: weekEntriesQuery.weekEntries.timeEntries
			}
		);
		return hoursBalanceUpToDate;
	}

	/**
	 * Calculate the total hours balance follwing the rule:
	 * totalHoursBalance = hours balance (fetched from server) + local_balance (from the edit day)
	 * local balace = select day laboured hours - contract day laboured hours
	 * @param {Object[]} timeEntries is an array of {hours, minutes} as state.storedTimes
	 */
	_calculateTotalHoursBalance(timeEntries) {
		const { balance, dailyContractedHours } = this.props.userDetailsQuery.userDetails;
		const hoursBalanceDuration = new TimeDuration(balance);
		const selectedDayHoursBalance = (timesAreValid(timeEntries) &&
			new TimeDuration(calculateLabouredHours(timeEntries))) || new TimeDuration();

		return (
			hoursBalanceDuration
				.add(selectedDayHoursBalance
					.subtract(dailyContractedHours))
				.toString()
		);
	}

	render() {
		const {
			controlDate,
			labouredHoursOnDay,
			hoursBalanceUpToDate,
			storedTimes,
			phase,
			activity,
			controlDateIsValid,
			calendarDayStyles,
			alertMessage
		} = this.state;

		const {
			dailyContractedHours
		} = this.props.userDetailsQuery.userDetails || {};

		const {
			weekEntries
		} = this.props.weekEntriesQuery;

		const projectPhases = this.props.projectPhasesQuery.phases || {};

		const activityOptions = phase.activities.options ? phase.activities.options : [];

		const isHoliday = activity.id === SPECIAL_ACTIVITY_HOLIDAY.id;
		const shouldHideTimeGroup = index => isHoliday && (index === 1 || index === 2);
		const isEditionDisabled = isHoliday || !controlDateIsValid;

		let alternativeTextForProjectPhase = projectPhases.options ? null : strings.loading;
		if (projectPhases.options && projectPhases.options.length === 1) {
			alternativeTextForProjectPhase = projectPhases.options[0].name;
		}
		let alternativeTextForActivity = projectPhases.options ? null : strings.loading;
		if (isHoliday) {
			alternativeTextForActivity = SPECIAL_ACTIVITY_HOLIDAY.name;
		}

		const isTimeEntryPersisted = this._isControlDatePersisted();
		const submitAction = isTimeEntryPersisted ?
			this.props.updateTimeEntry :
			this.props.addTimeEntry;

		return (
			<div className="page-wrapper">
				<PageLoading
					active={this.props.weekEntriesQuery.loading}
				/>
				<h2 className="current-date">
					{strings.dateBeingEdited}:{' '}
					<strong>{controlDate.format('L')}</strong>
				</h2>
				<form onSubmit={this.onSubmit(submitAction)} className="columns">
					<div className="column column-half column-right-aligned">
						<DatePicker
							inline
							highlightDates={calendarDayStyles}
							selected={this.state.controlDate}
							onChange={this.onDateChange}
							filterDate={date => date.isSameOrBefore(moment(), 'day')}
							maxTime={moment()}
						/>
						<LabourStatistics
							dayHoursLaboured={labouredHoursOnDay}
							dayHoursEntitled={dailyContractedHours}
							weekHoursLaboured={hoursBalanceUpToDate.labouredHoursUpToDate}
							weekHoursEntitled={hoursBalanceUpToDate.contractedHoursUpToDate}
							hoursBalance={this._calculateTotalHoursBalance(storedTimes)}
						/>
					</div>
					<div className="column column-half">
						<Panel message={this.state.successMessage} type="success" />
						<Panel message={this.state.errorMessage} type="error" />
						<SelectGroup
							name="projectPhase"
							label={strings.projectPhase}
							options={projectPhases.options}
							selected={phase.id}
							onChange={this._setProjectPhase(projectPhases.options)}
							showTextInstead={alternativeTextForProjectPhase}
							tabIndex={START_TABINDEX}
							disabled={isEditionDisabled}
						/>
						<SelectGroup
							name="activity"
							label={strings.activity}
							options={activityOptions}
							selected={activity.id}
							onChange={this._setActivity(phase.activities.options)}
							showTextInstead={alternativeTextForActivity}
							tabIndex={START_TABINDEX + 1}
							disabled={isEditionDisabled}
						/>
						{referenceHours.map((refHour, index) => (
							<TimeGroup
								key={refHour}
								label={strings.times[index].label}
								emphasis={index === 0 || index === 3}
								tabIndexes={START_TABINDEX + 2 + (index * 2)}
								referenceHour={refHour}
								time={storedTimes[index] || '00'}
								shouldHaveFocus={this._shouldHaveFocus(index)}
								onSet={this.onTimeSet(index)}
								onFocus={this.onFieldFocus(index)}
								hidden={shouldHideTimeGroup(index)}
								disabled={isEditionDisabled}
							/>
						))}
						<button
							type="submit"
							className="send"
							ref={(button) => { this.submitButton = button; }}
							disabled={!this._shouldSendBeAvailable()}
							tabIndex={CTA_TABINDEX}
						>
							{isTimeEntryPersisted ? strings.update : strings.send}
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
				</form>
				<WeeklyCalendar
					controlDate={controlDate}
					weekEntries={weekEntries}
					storedTimes={storedTimes}
				/>
				<AlertModal
					active={Boolean(alertMessage)}
					content={alertMessage}
					onClose={this.onAlertClose}
				/>
			</div>
		);
	}
}

export default compose(
	graphql(queries.addTimeEntry, { name: 'addTimeEntry' }),
	graphql(queries.updateTimeEntry, { name: 'updateTimeEntry' }),
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
	updateTimeEntry: PropTypes.func.isRequired,
	weekEntriesQuery: PropTypes.object.isRequired,
	projectPhasesQuery: PropTypes.object.isRequired,
	userDetailsQuery: PropTypes.object.isRequired
};
