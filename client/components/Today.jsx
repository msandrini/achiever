/* global window */
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import DB from 'minimal-indexed-db';
import { graphql, compose } from 'react-apollo';

import * as queries from '../queries.graphql';
import AlertModal from './ui/modals/AlertModal';
import ConfirmModal from './ui/modals/ConfirmModal';
import StaticTime from './today/StaticTime';
import PageLoading from './genericPages/PageLoading';
import strings from '../../shared/strings';
import {
	allTimesAreFilled,
	getTodayStorage,
	setTodayStorage,
	submitToServer,
	timesAreValid
} from '../utils';
import {
	isActiveDayOjbect,
	goBack
} from './today/utils';

const MODAL_ALERT = 'alert';
const MODAL_CONFIRM = 'confirm';
const storedTimePosition = ['startTime', 'breakStartTime', 'breakEndTime', 'endTime'];

class Today extends React.Component {
	constructor() {
		super();
		this.state = {
			storedTimes: {
				startTime: { hours: null, minutes: null },
				breakStartTime: { hours: null, minutes: null },
				breakEndTime: { hours: null, minutes: null },
				endTime: { hours: null, minutes: null }
			},
			persisted: false,
			showModal: null,
			alertInfo: {},
			buttonDisabled: false
		};
		this.onMark = this.onMark.bind(this);
		this._getButtonString = this._getButtonString.bind(this);
		this._getTime = this._getTime.bind(this);
		this._getNextTimeEntryPoint = this._getNextTimeEntryPoint.bind(this);
		this._shouldButtonBeAvailable = this._shouldButtonBeAvailable.bind(this);
		this._onConfirmSubmit = this._onConfirmSubmit.bind(this);
		this._hideAlert = this._hideAlert.bind(this);
		this._checkEnteredValues = this._checkEnteredValues.bind(this);
	}

	async componentDidMount() {
		await this._checkEnteredValues(this.props.dayEntryQuery);
	}

	async componentWillReceiveProps(nextProps) {
		// If finished (was loading and stoped) loading from server and no erros fill the state
		const {
			loading,
			error
		} = nextProps.dayEntryQuery;

		if (this.props.dayEntryQuery.loading && !loading && !error) {
			await this._checkEnteredValues(nextProps.dayEntryQuery);
		}
	}

	/**
	 * Function called on button click. It should fill the localStorage/state when clicked and
	 * send the data to server on the last iteration
	 * @param {*} event
	 */
	async onMark(event) {
		event.preventDefault();
		// Should insert on localStorage...

		const momentTime = {
			hours: Number(moment().format('HH')),
			minutes: Number(moment().format('mm'))
		};

		const date = moment();
		const index = this._getNextTimeEntryPoint();
		const storedTimes = { ...this.state.storedTimes };
		storedTimes[index] = momentTime;

		if (timesAreValid(storedTimes)) {
			if (index === 'endTime') {
				try {
					// Send it and push from dayEntry to indexedDB
					// (do not need to insert on localStorage)
					const submited = await submitToServer(date, storedTimes, this.props.addTimeEntry);
					if (submited) {
						// Insert it on storedTimes
						this.setState({
							storedTimes,
							persisted: true
						});

						// fetch day entry
						// insert it on indexedDB
					}
					return;
				} catch (e) {
					console.error(e);
					return;
				}
			}

			setTimeout(() => {
				this.setState({ buttonDisabled: false });
			}, 60000);
			this.setState({ buttonDisabled: true });

			// Insert info
			this.setState({ storedTimes });
			setTodayStorage(storedTimes);
		} else {
			// Alert that times are not valid
			this.setState({
				alertInfo: {
					content: strings.invalidAddTime,
					onClose: this._hideAlert
				},
				showModal: MODAL_ALERT
			});
		}
	}

	async _onConfirmSubmit() {
		this.setState({});

		// Send it and push from dayEntry to indexedDB
		// (do not need to insert on localStorage)
		// fetch day entry
		// insert it on indexedDB
	}

	/**
	 * Check if today data is in indexedDB,
	 * if so, propagate it to state
	 * if not:
	 *  Check localStorage:
	 * 	if so, propagate it to state
	 *	if not, propagate empty state.
	 */
	async _checkEnteredValues() {
		try {
			// First fetch from DB and check if it's already there
			const db = await DB('entries', 'date');
			const todayEntry = await db.getEntry(moment().format('YYYY-MM-DD'));

			if (todayEntry) {
				// Fill the fields using this info
				const {
					startTime,
					breakStartTime,
					breakEndTime,
					endTime
				} = todayEntry;
				const storedTimes = {
					startTime,
					breakStartTime,
					breakEndTime,
					endTime
				};
				this.setState({ storedTimes, persisted: true });
				return;
			}
		} catch (e) {
			console.error(e);
		}

		// If not in indexedDB, check localStorage.
		const storedTimes = getTodayStorage();
		if (storedTimes) {
			if (allTimesAreFilled(storedTimes)) {
				if (timesAreValid(storedTimes)) {
					// Confirm send modal
					this.setState({
						showModal: MODAL_CONFIRM
					});
				} else {
					// Invald times modal
					this.setState({
						alertInfo: {
							content: strings.invalidTime,
							onClose: () => goBack()
						},
						showModal: MODAL_ALERT
					});
				}
			} else {
				this.setState({ storedTimes, persisted: false });
			}
		}

		// If not in localStorage - do nothing :-)
	}

	_getTime(index) {
		return this.state.storedTimes[index];
	}

	_getButtonString() {
		const nextPosition = this._getNextTimeEntryPoint();
		const len = storedTimePosition.findIndex(e => (e === nextPosition));
		if (len !== -1) {
			return (
				<span>
					{strings.markNow} <strong>{strings.times[len].label}</strong>
				</span>
			);
		}
		return (
			<span />
		);
	}

	_getNextTimeEntryPoint() {
		for (const value of storedTimePosition) {
			const selectedStoredTimes = this.state.storedTimes[value];
			if (selectedStoredTimes.hours === null || selectedStoredTimes.minutes === null) {
				return value;
			}
		};
		return '';
	}

	_shouldButtonBeAvailable() {
		return !(
			this._getNextTimeEntryPoint() === '' ||
			(
				this.state.storedTimes.breakStartTime.hours === null &&
				this.state.storedTimes.endTime.hours
			)
		);
	}

	_hideAlert() {
		this.setState({
			showModal: null
		});
	}

	render() {
		const { dayEntryQuery } = this.props;
		const {
			alertInfo,
			buttonDisabled,
			showModal,
			storedTimes
		} = this.state;

		return (
			<div className="page-wrapper">
				<PageLoading
					active={dayEntryQuery.loading}
				/>
				<h2 className="current-date">
					{strings.todayDate}:{' '}
					<strong>{moment().format('L')}</strong>
				</h2>
				<form onSubmit={e => this.onMark(e)} className="columns">
					<div className="column column-half">
						{storedTimePosition.map((value, index) => (
							<StaticTime
								key={value}
								time={this._getTime(value)}
								label={strings.times[index].label}
								emphasis={isActiveDayOjbect(storedTimes[value])}
							/>
						))}
					</div>
					<div className="column column-half">
						{this._shouldButtonBeAvailable() ?
							<button
								type="submit"
								className="send send-today"
								disabled={buttonDisabled}
							>
								{this._getButtonString()}
							</button>
							:
							<span className="time-sent">{strings.timeSentToday}</span>
						}
					</div>
				</form>
				<AlertModal
					active={showModal === MODAL_ALERT}
					content={alertInfo.content}
					onClose={alertInfo.onClose}
				/>
				<ConfirmModal
					active={showModal === MODAL_CONFIRM}
					content={strings.confirmSave}
					onCancel={() => goBack()}
					onConfirm={this._onConfirmSubmit}
				/>
			</div>
		);
	}
}

export default compose(
	graphql(queries.addTimeEntry, {
		name: 'addTimeEntry'
	}),
	graphql(queries.dayEntry, {
		name: 'dayEntryQuery',
		options: { variables: { date: moment().format('YYYY-MM-DD') } }
	})
)(Today);

Today.propTypes = {
	addTimeEntry: PropTypes.func.isRequired,
	dayEntryQuery: PropTypes.object.isRequired
};

Today.contextTypes = {
	router: PropTypes.object
};
