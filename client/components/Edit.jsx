import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { graphql, compose } from 'react-apollo';
import DB from 'minimal-indexed-db';
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
	// dismemberTimeString,
	isDayAfterToday,
	// replacingValueInsideArray,
	submitToServer,
	timesAreValid,
	getTimeEntriesForWeek,
	isControlDatePersisted,
	SPECIAL_ACTIVITY_HOLIDAY
} from '../utils';

const storedTimePosition = ['startTime', 'breakStartTime', 'breakEndTime', 'endTime'];
const START_TABINDEX = 0;
const CTA_TABINDEX = 10;

class Edit extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			controlDate: moment(),
			controlDateIsValid: true,
			controlDateIsPersisted: false,
			labouredHoursOnDay: null,
			hoursBalanceUpToDate: {},
			storedTimes: {
				breakEndTime: { hours: null, minutes: null },
				breakStartTime: { hours: null, minutes: null },
				endTime: { hours: null, minutes: null },
				startTime: { hours: null, minutes: null }
			},
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
			persisted: false,
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
		this._populateProjectPhaseAndActivity =	this._populateProjectPhaseAndActivity.bind(this);

		this.submitButton = null;
	}

	async componentWillMount() {
		// Select day on mount;
		await this.onDateChange(moment());
	}

	async componentWillReceiveProps(nextProps) {
		const {
			projectPhasesQuery,
			dayEntryQuery
		} = nextProps;

		const { error } = projectPhasesQuery || dayEntryQuery;
		if (error) {
			this.setState({ errorMessage: error });
			return;
		}

		// For the first execution of the query
		if (this.props.projectPhasesQuery.loading && !projectPhasesQuery.loading) {
			this._populateProjectPhaseAndActivity(projectPhasesQuery, dayEntryQuery);
		}

		if (this.props.dayEntryQuery.loading && !dayEntryQuery.loading) {
			// MAYBE: Do the two lines below
			// const storedTimesAndInfos = await this._storedTimeFromDate(this.state.controlDate);
			// this.setState(storedTimesAndInfos);
			// Populate the phases and activity from the dayEntry.
			await this._populateProjectPhaseAndActivity(projectPhasesQuery, dayEntryQuery);
		}
	}

	onAlertClose() {
		this.setState({ alertMessage: null });
	}

	/**
	 * returns a function that changes controlDate (selected day) and fetch new infos from server
	 */
	async onDateChange(date) {
		const isAfterToday = isDayAfterToday(date);
		if (isAfterToday) {
			this.setState({ alertMessage: strings.cannotSelectFutureTime });
			return;
		}

		// Get { persisted, labouredHoursOnDay, hoursBalanceUpToDate } for the selected day
		const storedTimesAndInfos = await this._storedTimeFromDate(date);
		const controlDateIsPersisted = await isControlDatePersisted(date);

		this.setState({
			...storedTimesAndInfos,
			controlDate: date,
			controlDateIsValid: true,
			controlDateIsPersisted,
			errorMessage: '',
			successMessage: ''
		});

		await this._fetchDayEntry(date);

		const {
			projectPhasesQuery,
			dayEntryQuery
		} = this.props;

		if (dayEntryQuery.dayEntry) {
			this._populateProjectPhaseAndActivity(projectPhasesQuery, dayEntryQuery);
		}
	}

	onTimeChange(groupIndex) {
		return async (hours = 0, minutes = 0) => {
			let shouldUpdateIndexedDB = false;
			const timeEntries = await getTimeEntriesForWeek(this.state.controlDate);
			const hoursToObj = hours === null ? null : Number(hours);
			const minutesToObj = minutes === null ? null : Number(minutes);
			const composedTime = { hours: hoursToObj, minutes: minutesToObj };

			this.setState((currentState) => {
				const storedTimes = {
					...currentState.storedTimes,
					[storedTimePosition[groupIndex]]: composedTime				// THIS IS WRONG ??
				};

				const labouredHoursOnDay = (timesAreValid(storedTimes) &&
					calculateLabouredHours(storedTimes)) || '';

				const paramsToSend = {
					contractedHoursForADay: this.props.userDetailsQuery.userDetails.dailyContractedHours,
					labouredHoursOnDay,
					timeEntries
				};
				const hoursBalanceUpToDate = calculateHoursBalanceUpToDate(
					currentState.controlDate,
					paramsToSend
				);

				const newState = {
					...currentState,
					storedTimes,
					labouredHoursOnDay,
					hoursBalanceUpToDate
				};

				if (areTheSameDay(currentState.controlDate, moment())) {
					shouldUpdateIndexedDB = { ...newState };
				}

				return newState;
			});
			if (shouldUpdateIndexedDB) {
				try {
					const db = await DB('entries', 'date');
					await db.put({
						date: this.state.controlDate.format('YYYY-MM-DD'),
						startTime: shouldUpdateIndexedDB.storedTimes.startTime,
						breakStartTime: shouldUpdateIndexedDB.storedTimes.breakStartTime,
						breakEndTime: shouldUpdateIndexedDB.storedTimes.breakEndTime,
						endTime: shouldUpdateIndexedDB.storedTimes.endTime,
						paidTime: shouldUpdateIndexedDB.labouredHoursOnDay,
						persisted: shouldUpdateIndexedDB.persisted
					});
				} catch (e) {
					console.error(e);
				}
			}
		};
	}

	onSubmit(callback) {
		return async (event) => {
			const _this = this;
			event.preventDefault();
			const { storedTimes, phase, activity } = { ...this.state };
			const date = this.state.controlDate;
			const ret = await submitToServer(date, storedTimes, phase, activity, callback);
			if (ret.successMessage) {
				this.setState({ ...this.state, ...ret, persisted: true });
				try {
					const db = await DB('entries', 'date');
					await db.put({
						date: date.format('YYYY-MM-DD'),
						storedTimes,
						persisted: true
					});
					_this.dayEntryQuery(date);
				} catch (e) {
					console.error(e);
				}
			} else {
				this.setState(ret);
			}
		};
	}

	onSetProjectPhase(value) {
		const { phases } = this.props.projectPhasesQuery;
		const id = parseInt(value, 10);
		const phase = phases.options.find(option => option.id === id);

		const { activities } = phase;
		const activity = activities.options.find(option => option.id === activities.default);

		this.setState({
			phase,
			activity
		});
	}

	onSetActivity(value) {
		const { activities } = this.state.phase;
		const id = parseInt(value, 10);
		const activity = activities.options.find(option => option.id === id);

		if (activity) {
			this.setState({	activity });
		}
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
	async _fetchDayEntry(date) {
		const { refetch } = this.props.dayEntryQuery;
		await refetch({ date: date.format('YYYY-MM-DD') });
	}

	/**
	 * Return state hoursBalanceUpToDate based on weekentries
	 * @param {Object} date is a Moment() of the selected day.
	 * @param {Object} labouredHoursOnDay is how many hours the user has worked that day
	 * @return {Object} { contractedHoursUpToDate, labouredHoursUpToDate }.
	 */
	async _getHoursBalanceValues(date, labouredHoursOnDay) {
		const weekTimeEntries = await getTimeEntriesForWeek(date);
		const hoursBalanceUpToDate = calculateHoursBalanceUpToDate(
			date,
			{
				labouredHoursOnDay,
				contractedHoursForADay: this.props.userDetailsQuery.userDetails.dailyContractedHours,
				timeEntries: weekTimeEntries
			}
		);
		return hoursBalanceUpToDate;
	}

	/**
	 * Given a date, select and propagate it from indexedDB
	 * @param {Object} date - a moment date object
	 * @return {storedTimes, persisted, labouredHoursOnDay, hoursBalanceUpToDate}
	 */
	async _storedTimeFromDate(date) {
		const db = await DB('entries', 'date');
		const timeEntry = await db.getEntry(date.format('YYYY-MM-DD'));

		if (timeEntry) {
			const isToday = areTheSameDay(moment(timeEntry.date), moment());
			const timeEntriesStoredTimes = {
				startTime: timeEntry.startTime,
				breakStartTime: timeEntry.breakStartTime,
				breakEndTime: timeEntry.breakEndTime,
				endTime: timeEntry.endTime
			} 
			const labouredHoursOnDay = timeEntry.paidTime ||
				calculateLabouredHours(timeEntriesStoredTimes);
			const hoursBalanceUpToDate = await this._getHoursBalanceValues(
				date,
				labouredHoursOnDay
			);

			if (isToday) {
				return ({
					storedTimes: timeEntriesStoredTimes,
					sent: timeEntry.sent,
					labouredHoursOnDay: (
						timeEntry.storedTimes &&
						timesAreValid(timeEntry.storedTimes) &&
						calculateLabouredHours(timeEntry.storedTimes)
					) || '',
					hoursBalanceUpToDate
				});
			}

			return ({
				storedTimes: timeEntriesStoredTimes,
				persisted: timeEntry.persisted,
				labouredHoursOnDay,
				hoursBalanceUpToDate
			});
		}
		return {
			storedTimes: {
				startTime: { hours: null, minutes: null },
				breakStartTime: { hours: null, minutes: null },
				breakEndTime: { hours: null, minutes: null },
				endTime: { hours: null, minutes: null }
			},
			persisted: false,
			labouredHoursOnDay: '0',
			hoursBalanceUpToDate: '0'
		};
	}

	_shouldSendBeAvailable() {
		return timesAreValid(this.state.storedTimes);
	}

	/**
	 * Insert the default project phase and activity
	 * @param {*} projectPhases
	 */
	_populateProjectPhaseAndActivity(projectPhasesQuery, dayEntryQuery) {
		const { phases, loading, error } = projectPhasesQuery;
		const { timeEntry } = dayEntryQuery && dayEntryQuery.dayEntry;


		if (loading || error) {
			return;
		}

		// Set queried project phases and activities from server - default if none from dayquery
		const phase = phases.options.find(option => option.name === timeEntry.phase) ||
			phases.options.find(option => option.id === phases.default);
		const { activities } = phase;

		let activity;
		if (timeEntry.activity === SPECIAL_ACTIVITY_HOLIDAY.name) {
			activity = SPECIAL_ACTIVITY_HOLIDAY;
		} else {
			activity = activities.options.find(option => option.name === timeEntry.activity) ||
				activities.options.find(option => option.id === activities.default);
		}

		this.setState({
			phase,
			activity
		});
	}

	render() {
		const {
			controlDate,
			controlDateIsPersisted,
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


		const isHoliday = activity.id === SPECIAL_ACTIVITY_HOLIDAY.id;
		const isEditionDisabled = isHoliday || !controlDateIsValid;

		const submitAction = controlDateIsPersisted ?
			this.props.updateTimeEntry :
			this.props.addTimeEntry;

		return (
			<div className="page-wrapper">
				<PageLoading
					active={this.props.projectPhasesQuery.loading}
				/>
				<h2 className="current-date">
					{strings.dateBeingEdited}:{' '}
					<strong>{controlDate.format('L')}</strong>
				</h2>
				<form onSubmit={this.onSubmit(submitAction)} className="columns">
					<div className="column column-half column-right-aligned">
						<MonthlyCalendar
							controlDate={controlDate}
							onDateChange={this.onDateChange}
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
							isLoading={this.props.dayEntryQuery.loading}
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
							{controlDateIsPersisted ? strings.update : strings.send}
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
	graphql(queries.dayEntry, {
		name: 'dayEntryQuery',
		options: { variables: { date: moment().format('YYYY-MM-DD') } }
	})
)(Edit);

Edit.propTypes = {
	addTimeEntry: PropTypes.func.isRequired,
	updateTimeEntry: PropTypes.func.isRequired,
	projectPhasesQuery: PropTypes.object.isRequired,
	userDetailsQuery: PropTypes.object.isRequired,
	dayEntryQuery: PropTypes.object.isRequired
};
