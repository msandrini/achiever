import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { graphql, compose } from 'react-apollo';
import 'react-datepicker/dist/react-datepicker.css';

import ActiveDayTasks from './edit/ActiveDayTasks';
import ActiveDayTimes from './edit/ActiveDayTimes';
import AlertModal from './ui/modals/AlertModal';
import LabourStatistics from './edit/LabourStatistics';
import MonthlyCalendar from './edit/MonthlyCalendar';
import Panel from './ui/Panel';
import PageLoading from './genericPages/PageLoading';
import WeeklyCalendar from './edit/WeeklyCalendar';

import strings from '../../shared/strings';
import * as queries from '../queries.graphql';
import {
	areTheSameDay,
	calculateHoursBalanceUpToDate,
	calculateLabouredHours,
	dismemberTimeString,
	getTodayStorage,
	isDayBlockedInPast,
	isDayAfterToday,
	replacingValueInsideArray,
	setTodayStorage,
	submitToServer,
	timesAreValid,
	SPECIAL_ACTIVITY_HOLIDAY
} from '../utils';

const START_TABINDEX = 0;
const CTA_TABINDEX = 10;

const _getChosenDateInfoFromWeekInfo = (date, { timeEntries }) =>
	timeEntries.find(item => item.date === date.format('YYYY-MM-DD'));

class Edit extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			controlDate: moment(),
			controlDateIsValid: true,
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
			sentToday: false,
			errorMessage: '',
			successMessage: '',
			alertMessage: null
		};

		this.onAlertClose = this.onAlertClose.bind(this);
		this.onDateChange = this.onDateChange.bind(this);
		this.onTimeChange = this.onTimeChange.bind(this);
		this.onSetActivity = this.onSetActivity.bind(this);
		this.onSetProjectPhase = this.onSetProjectPhase.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
		this.focusOnSubmit = this.focusOnSubmit.bind(this);
		this._getHoursBalanceValues = this._getHoursBalanceValues.bind(this);
		this._imReligious = this._imReligious.bind(this);
		this._isControlDatePersisted = this._isControlDatePersisted.bind(this);
		this._setPhaseAndActivityForChosenDate = this._setPhaseAndActivityForChosenDate.bind(this);
		this._populateProjectPhaseAndActivity =	this._populateProjectPhaseAndActivity.bind(this);

		this.submitButton = null;
	}

	componentWillMount() {
		this.onDateChange()(this.state.controlDate);
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
		}

		if (this.props.projectPhasesQuery.loading && !projectPhasesQuery.loading) {
			this._populateProjectPhaseAndActivity(projectPhasesQuery.phases);
		}
	}

	onAlertClose() {
		this.setState({ alertMessage: null });
	}

	/**
	 * returns a function that changes controlDate (selected day) and fetch new infos from server
	 */
	onDateChange() {
		return (date) => {
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
			}
		};
	}

	onTimeChange(groupIndex) {
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

	onSetProjectPhase(phases) {
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

	onSetActivity(activities) {
		return (value) => {
			const id = parseInt(value, 10);
			const activity = activities.find(option => option.id === id);

			if (activity) {
				this.setState({	activity });
			}
		};
	}

	focusOnSubmit() {
		this.submitButton.focus();
	}

	_imReligious() {
		this.onTimeChange(0)(7, 30);
		this.onTimeChange(1)(11, 30);
		this.onTimeChange(2)(12, 30);
		this.onTimeChange(3)(16, 30);
	}

	/**
	 * Fecth the weekEntries of the given date
	 * @param {Object} date is a moment() object
	 */
	async _fetchWeekEntries(date) {
		const { refetch } = this.props.weekEntriesQuery;
		await refetch({ date: date.format('YYYY-MM-DD') });
		this._setTimesForChosenDate(date, this.props.weekEntriesQuery);
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

	_shouldSendBeAvailable() {
		return timesAreValid(this.state.storedTimes);
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

	render() {
		const {
			controlDate,
			labouredHoursOnDay,
			hoursBalanceUpToDate,
			storedTimes,
			phase,
			activity,
			controlDateIsValid,
			alertMessage
		} = this.state;

		const {
			lastFridayBalance,
			dailyContractedHours
		} = this.props.userDetailsQuery.userDetails || {};

		const {
			weekEntries
		} = this.props.weekEntriesQuery;

		const isHoliday = activity.id === SPECIAL_ACTIVITY_HOLIDAY.id;
		const isEditionDisabled = isHoliday || !controlDateIsValid;

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
						<MonthlyCalendar
							controlDate={controlDate}
							onDateChange={this.onDateChange()}
							weekEntries={weekEntries}
						/>
						<LabourStatistics
							dayHoursLaboured={labouredHoursOnDay}
							dayHoursEntitled={dailyContractedHours}
							weekHoursLaboured={hoursBalanceUpToDate.labouredHoursUpToDate}
							weekHoursEntitled={hoursBalanceUpToDate.contractedHoursUpToDate}
							rawBalance={lastFridayBalance}
						/>
					</div>
					<div className="column column-half">
						<Panel message={this.state.successMessage} type="success" />
						<Panel message={this.state.errorMessage} type="error" />
						<ActiveDayTasks
							disable={isEditionDisabled}
							isHoliday={isHoliday}
							onPhaseSelect={this.onSetProjectPhase}
							onActivitySelect={this.onSetActivity}
							projectPhasesQuery={this.props.projectPhasesQuery}
							selectedActivity={activity}
							selectedPhase={phase}
							tabIndex={START_TABINDEX}
						/>
						<ActiveDayTimes
							disabled={isEditionDisabled}
							focusOnSubmit={this.focusOnSubmit}
							isHoliday={isHoliday}
							onTimeChange={this.onTimeChange}
							storedTimes={storedTimes}
							tabIndex={START_TABINDEX + 2}
						/>
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
							onClick={this._imReligious}
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
