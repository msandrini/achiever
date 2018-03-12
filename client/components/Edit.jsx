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
	getLastBalance,
	getTimeEntriesForWeek,
	getTodayStorage,
	setTodayStorage,
	isDayAfterToday,
	propagateQuery,
	submitToServer,
	timesAreValid,
	SPECIAL_ACTIVITY_HOLIDAY
} from '../utils';
import apolloClient from '../apolloClient';


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
			labouredHoursOnDay: '0:00',
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
			alertMessage: null,
			balance: '0:00'
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
			this._populateProjectPhaseAndActivity(projectPhasesQuery, dayEntryQuery);

			// Fetched today from server.
			if (areTheSameDay(moment(), moment(dayEntryQuery.dayEntry.date))) {
				if (dayEntryQuery.dayEntry.total !== '') {
					propagateQuery('dayEntry', dayEntryQuery.dayEntry);
				}
			}
		}
	}

	onAlertClose() {
		this.setState({ alertMessage: null });
	}

	/**
	 * Set the state of Edit page within the data that is needed and refetch.
	 * @param {Object} date moment.js oject
	 */
	async onDateChange(date) {
		const isAfterToday = isDayAfterToday(date);
		if (isAfterToday) {
			this.setState({ alertMessage: strings.cannotSelectFutureTime });
			return;
		}


		// Get { storedTimes, labouredHoursOnDay, hoursBalanceUpToDate } for the selected day
		const storedTimesAndInfos = await this._timeFromDate(date);
		const balance = await getLastBalance(date);

		this.setState({
			controlDate: date,
			controlDateIsValid: true,
			...storedTimesAndInfos,
			errorMessage: '',
			successMessage: '',
			balance
		});

		await this._fetchDayEntry(date);

		// Dont think this is necessary because of componentWillReceive props. But will keep as cmt
		const {
			projectPhasesQuery,
			dayEntryQuery
		} = this.props;

		if (projectPhasesQuery && dayEntryQuery && dayEntryQuery.dayEntry) {
			this._populateProjectPhaseAndActivity(projectPhasesQuery, dayEntryQuery);
		}
	}

	/**
	 * Change the time of this.state.controDate
	 * It will change the state and localStorage if not persisted else only state
	 * @param {*} groupIndex
	 * @returns {func} - anonimous function that receives (hours, minuttes) and set component state
	 */
	onTimeChange(groupIndex) {
		return async (hours = 0, minutes = 0) => {
			this.setState({});
			let storedTimes = null;
			const hoursToObj = hours === null ? null : Number(hours);
			const minutesToObj = minutes === null ? null : Number(minutes);
			const composedTime = { hours: hoursToObj, minutes: minutesToObj };

			const timeEntries = await getTimeEntriesForWeek(this.state.controlDate);

			this.setState((currentState) => {
				storedTimes = {
					...this.state.storedTimes,
					[storedTimePosition[groupIndex]]: composedTime
				};

				const labouredHoursOnDay = (
					timesAreValid(storedTimes) &&
					calculateLabouredHours(storedTimes)
				) || '';

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

				return newState;
			});
			const isToday = areTheSameDay(this.state.controlDate, moment());
			if (isToday && !this.state.controlDateIsPersisted) {
				setTodayStorage(storedTimes);
			}
		};
	}

	onSubmit(callback) {
		return async (event) => {
			event.preventDefault();
			const {
				controlDate,
				storedTimes,
				phase,
				activity
			} = { ...this.state };
			const ret = await submitToServer(controlDate, storedTimes, callback, phase, activity);
			if (ret.successMessage) {
				const isToday = areTheSameDay(moment(), controlDate);
				if (isToday) {
					// Refetch dayEntry
					this._fetchDayEntry(controlDate);
				} else {
					// Refetch allEntries
					const allEntriesQuery = await apolloClient.query({
						query: queries.allEntries
					});
					propagateQuery('allEntries', allEntriesQuery.data.allEntries);
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
	 * @param {Object} labouredHoursOnDay is how many hours the user worked that day
	 * @param {IndexedDBObj} db is a opened indexedDB object
	 * @return {Object} {
	 * 	contractedHoursUpToDate		// This is how many hours the user should have worked
	 * 	labouredHoursUpToDate 		// This is how many hours the user worked based on localStorage
	 * }
	 */
	async _getHoursBalanceValues(date, labouredHoursOnDay, db = null) {
		const weekTimeEntries = await getTimeEntriesForWeek(date, db);
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
	 * Given a date, get time from indexedDB or localStorage or create it
	 * So, first check indexedDB:
	 *  Is it there?
	 *   -> Yes: Fetch from indexedDB
	 *   -> No : So fetch from localStorage
	 *   -> Not there: empty
	 * @param {Object} date - a moment date object
	 * @return {storedTimes, persisted, labouredHoursOnDay, hoursBalanceUpToDate}
	 */
	async _timeFromDate(date) {
		const isToday = areTheSameDay(moment(date), moment());

		const db = await DB('entries', 'date');
		const timeEntry = await db.getEntry(date.format('YYYY-MM-DD'));

		if (timeEntry) {
			const timeEntriesStoredTimes = {
				startTime: timeEntry.startTime,
				breakStartTime: timeEntry.breakStartTime,
				breakEndTime: timeEntry.breakEndTime,
				endTime: timeEntry.endTime
			};
			const labouredHoursOnDay = timeEntry.paidTime ||
				calculateLabouredHours(timeEntriesStoredTimes);
			const hoursBalanceUpToDate = await this._getHoursBalanceValues(
				date,
				labouredHoursOnDay,
				db
			);

			return ({
				storedTimes: timeEntriesStoredTimes,
				persisted: timeEntry.persisted,
				labouredHoursOnDay,
				hoursBalanceUpToDate,
				controlDateIsPersisted: true
			});
		}

		// If not in timeEntry and today, try getting from localStorage,
		if (isToday) {
			const storedTimes = getTodayStorage(); 

			if (storedTimes) {
				const labouredHoursOnDay = calculateLabouredHours(storedTimes);
				const hoursBalanceUpToDate = await this._getHoursBalanceValues(
					date,
					labouredHoursOnDay,
					db
				);

				return ({
					storedTimes,
					persisted: false,
					labouredHoursOnDay,
					hoursBalanceUpToDate,
					controlDateIsPersisted: false
				});
			}
		}

		// Default return;
		const hoursBalanceUpToDate = await this._getHoursBalanceValues(
			date,
			'00:00',
			db
		);
		return {
			storedTimes: {
				startTime: { hours: null, minutes: null },
				breakStartTime: { hours: null, minutes: null },
				breakEndTime: { hours: null, minutes: null },
				endTime: { hours: null, minutes: null }
			},
			persisted: false,
			labouredHoursOnDay: '00:00',
			hoursBalanceUpToDate,
			controlDateIsPersisted: false
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
			alertMessage,
			balance
		} = this.state;

		const {
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
							rawBalance={balance}
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
				{/* <WeeklyCalendar
					controlDate={controlDate}
					storedTimes={storedTimes}
				/> */}
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
