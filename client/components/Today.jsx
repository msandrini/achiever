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
	submitToServer,
	timesAreValid,
	allTimesAreFilled
} from '../utils';
import {
	isValidTimeObject,
	// getNextEmptyObjectOnArray,
	// timeSetIsValid,
	// allTimesAreFilled,
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

	async onMark(event) {
		event.preventDefault();
		// const this = this;
		setTimeout(() => {
			this.setState({ buttonDisabled: false });
		}, 60000);
		this.setState({ buttonDisabled: true });

		const momentTime = {
			hours: Number(moment().format('HH')),
			minutes: Number(moment().format('mm'))
		};
		const index = this._getNextTimeEntryPoint();
		const { storedTimes } = this.state;
		let { persisted } = this.state;
		storedTimes[index] = momentTime;

		if (timesAreValid(storedTimes)) {
			const db = await DB('entries', 'date');
			// Insert it to indexedDB and then insert set state. Also, if needed, send to server;
			let submited = false;
			this.setState((prevState) => {
				const newState = { ...prevState, storedTimes, persisted };
				if (index === 3) {
					const date = moment();
					submited = submitToServer(date, storedTimes, this.props.addTimeEntry);
				}
				return newState;
			});

			if (submited) {
				try {
					await submited;
					if (submited.successMessage) {
						persisted = true;
					} else {
						persisted = false;
					}
				} catch (e) {
					persisted = false;
				}
			}
			await db.put({
				date: moment().format('YYYY-MM-DD'),
				startTime: storedTimes.startTime,
				breakStartTime: storedTimes.breakStartTime,
				breakEndTime: storedTimes.breakEndTime,
				endTime: storedTimes.endTime,
				persisted
			});
		} else {
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
		try {
			const db = await DB('entries', 'date');
			const todayEntry = await db.getEntry(moment().format('YYYY-MM-DD'));
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
			const date = moment();
			const ret = await submitToServer(date, storedTimes, this.props.addTimeEntry);

			if (ret.successMessage) {
				this.setState({ storedTimes, persisted: true });
				await db.put({
					date: moment().format('YYYY-MM-DD'),
					persisted: true,
					startTime,
					breakStartTime,
					breakEndTime,
					endTime
				});
			} else {
				// Was not able to send to server even if user said to send
				goBack();
			}
		} catch (e) {
			console.error(e);
		}
	}

	async _checkEnteredValues() {
		try {
			const db = await DB('entries', 'date');
			// First fetch from DB and check if it's already there
			const todayEntry = await db.getEntry(moment().format('YYYY-MM-DD'));
			const {
				startTime,
				breakStartTime,
				breakEndTime,
				endTime,
				persisted
			} = todayEntry || {
				startTime: { hours: null, minutes: null },
				breakStartTime: { hours: null, minutes: null },
				breakEndTime: { hours: null, minutes: null },
				endTime: { hours: null, minutes: null }
			};

			const storedTimes = {
				startTime,
				breakStartTime,
				breakEndTime,
				endTime
			};

			if (storedTimes) {
				this.setState({
					storedTimes,
					persisted
				});
			}

			if (!persisted) {
				if (allTimesAreFilled(storedTimes)) {
					if (timesAreValid(storedTimes)) {
						this.setState({
							showModal: MODAL_CONFIRM
						});
					} else {
						this.setState({
							alertInfo: {
								content: strings.invalidTime,
								onClose: () => goBack()
							},
							showModal: MODAL_ALERT
						});
					}
				}
			}
		} catch (e) {
			console.error(e);
		}
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
								emphasis={isValidTimeObject(storedTimes[value])}
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
