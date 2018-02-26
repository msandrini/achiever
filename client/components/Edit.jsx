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
	// isDayBlockedInPast,
	isDayAfterToday,
	replacingValueInsideArray,
	submitToServer,
	timesAreValid,
	SPECIAL_ACTIVITY_HOLIDAY,
	getTimeEntriesForWeek
} from '../utils';
import DB from '../db';

const START_TABINDEX = 0;
const CTA_TABINDEX = 10;

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

		if (this.props.projectPhasesQuery.loading && !projectPhasesQuery.loading) {
			this._populateProjectPhaseAndActivity(projectPhasesQuery);
		}

		if (this.props.dayEntryQuery.loading && !dayEntryQuery.loading) {
			await this._propagateDayTime(dayEntryQuery);
			await this._setPhaseAndActivityForChosenDate();
		}
	}

	onAlertClose() {
		this.setState({ alertMessage: null });
	}

	/**
	 * returns a function that changes controlDate (selected day) and fetch new infos from server
	 */
	onDateChange() {
		return async (date) => {
			if (isDayAfterToday(date)) {
				this.setState({ alertMessage: strings.cannotSelectFutureTime });
				return;
			}

			await this._fetchDayEntry(date);
			const {
				projectPhasesQuery,
				dayEntryQuery
			} = this.props;


			const controlDateIsValid = !isDayAfterToday(date); // TO_DO

			this.setState({
				controlDate: date,
				controlDateIsValid,
				errorMessage: '',
				successMessage: ''
			});

			this._propagateDayTime(dayEntryQuery);
			if (dayEntryQuery.dayEntry) {
				this._populateProjectPhaseAndActivity(projectPhasesQuery);
			}
		};
	}

	onTimeChange(groupIndex) {
		return async (hours = 0, minutes = 0) => {
			let shouldUpdateIndexedDB = false;
			const timeEntries = await getTimeEntriesForWeek(this.state.controlDate);
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
					timeEntries
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
					shouldUpdateIndexedDB = { ...newState };
				}

				return newState;
			});
			try {
				const db = await DB('entries', 'date')
				await db.put({
					date: this.state.controlDate.format('YYYY-MM-DD'),
					storedTimes: shouldUpdateIndexedDB.storedTimes,
					sentToday: shouldUpdateIndexedDB.sentToday
				});
			} catch (e) {
				console.error(e);
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
				this.setState({ ...this.state, ...ret, sentToday: true });
				try {
					const db = await DB('entries', 'date')
					await db.put({
						date: date.format('YYYY-MM-DD'),
						storedTimes,
						sentToday: true
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
	 * @param {Object} controlDate is a Moment() of the selected day.
	 * @param {Object} weekEntriesQuery is the fecthed query return.
	 * @return {Object} { contractedHoursUpToDate, labouredHoursUpToDate }.
	 */
	async _getHoursBalanceValues(labouredHoursOnDay) {
		const weekTimeEntries = await getTimeEntriesForWeek(this.state.controlDate);
		const hoursBalanceUpToDate = calculateHoursBalanceUpToDate(
			this.state.controlDate,
			{
				labouredHoursOnDay,
				contractedHoursForADay: this.props.userDetailsQuery.userDetails.dailyContractedHours,
				timeEntries: weekTimeEntries
			}
		);
		return hoursBalanceUpToDate;
	}

	async _isControlDatePersisted() {
		const { controlDate } = this.state;

		try {
			const db = await DB('entries', 'date');
			const entry = await db.getEntry(controlDate.format('YYYY-MM-DD'));
			return Boolean(entry && entry.contractedTime);
		} catch(e) {
			console.error(e);
		}
	}

	_setPhaseAndActivityForChosenDate() {
		const { dayEntry } = this.props.dayEntryQuery;
		const activityFromDayData = dayEntry && dayEntry.activity;

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

	async _propagateDayTime(dayEntryQuery) {
		const {
			loading,
			error,
			dayEntry
		} = dayEntryQuery;

		const { timeEntry } = dayEntry;

		if (loading || error) {
			return;
		}

		if (timeEntry) {
			const startTime = moment(timeEntry.startTime, 'H:mm');
			const endTime = moment(timeEntry.endTime, 'H:mm');
			const labouredHoursOnDay = timeEntry.total;
			const isToday = areTheSameDay(moment(timeEntry.date), moment());
			const hoursBalanceUpToDate = await this._getHoursBalanceValues(
				moment(timeEntry.date),
				labouredHoursOnDay,
			);

			// If data is on server
			if (startTime.isValid() && endTime.isValid()) {
				const timesAsString = [
					timeEntry.startTime,
					timeEntry.startBreakTime,
					timeEntry.endBreakTime,
					timeEntry.endTime
				];
				const storedTimes = timesAsString.map(timeString =>
					dismemberTimeString(timeString));

				// If today was fetched
				if (isToday) {
					try {
						const db = await DB('entries', 'date');
						await db.put({
							date: moment().format('YYYY-MM-DD'),
							storedTimes,
							sentToday: true
						});
					} catch (e) {
						console.error(e);
					}
				}
				this.setState({
					storedTimes,
					sentToday: true,
					labouredHoursOnDay,
					hoursBalanceUpToDate
				});
			} else if (isToday) {
				// If today and not in server, try using localStorage
				try {
					const db = await DB('entries', 'date');
					const dayStorage = await db.getEntry(moment().format('YYYY-MM-DD'));
					const { storedTimes: dbStoredTimes, sentToday } = dayStorage || { };

					if (dbStoredTimes) {
						this.setState({
							storedTimes: dbStoredTimes,
							sentToday,
							labouredHoursOnDay: (dbStoredTimes && timesAreValid(dbStoredTimes) &&
								calculateLabouredHours(dbStoredTimes)) || '',
							hoursBalanceUpToDate
						});
					}
				} catch (e) {
					console.error(e);
				}
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

	/**
	 * Insert the default project phase and activity
	 * @param {*} projectPhases
	 */
	_populateProjectPhaseAndActivity(projectPhasesQuery) {
		const { phases, loading, error } = projectPhasesQuery;

		if (loading || error) {
			return;
		}
		// Set queried project phases and activities from server
		const phase = phases.options.find(option => option.id === phases.default);
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


		const isHoliday = activity.id === SPECIAL_ACTIVITY_HOLIDAY.id;
		const isEditionDisabled = isHoliday || !controlDateIsValid;

		const isTimeEntryPersisted = this._isControlDatePersisted();
		const submitAction = isTimeEntryPersisted ?
			this.props.updateTimeEntry :
			this.props.addTimeEntry;

		return (
			<div className="page-wrapper">
				<PageLoading
					active={this.props.dayEntryQuery.loading}
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
							isHoliday={isEditionDisabled}
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
							isHoliday={isEditionDisabled}
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
