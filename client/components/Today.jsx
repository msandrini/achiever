import React from 'react';
import moment from 'moment';

import StaticTime from './today/StaticTime';
import strings from '../../shared/strings';
import apiCalls from '../apiCalls';
import {
	STORAGEDAYKEY,
	STORAGEKEY,
	setTodayStorage,
	getTodayStorage,
	timeIsValid
} from '../../shared/utils';

import '../styles/today.styl';

export default class Today extends React.Component {
	constructor() {
		super();
		this.state = {
			controlDate: moment(),
			storedTimes: [{}, {}, {}, {}]
		};
		this.onMark = this.onMark.bind(this);
		this._validTimeEntry = this._validTimeEntry.bind(this);
		this._getButtonString = this._getButtonString.bind(this);
		this._submit = this._submit.bind(this);
		this._updateStoredTimes = this._updateStoredTimes.bind(this);
		this._getNextTimeEntryPoint = this._getNextTimeEntryPoint.bind(this);
		this._shouldSendBeAvailable = this._shouldSendBeAvailable.bind(this);
	}

	componentWillMount() {
		// Check if any value was defined before
		this.setState({ storedTimes: getTodayStorage(STORAGEKEY, STORAGEDAYKEY) });
	}

	onMark(event) {
		event.preventDefault();
		const index = this._getNextTimeEntryPoint();
		if (index === -1) {
			this._submit();
		} else {
			this._updateStoredTimes(index);
		}
	}

	_submit() {
		const { controlDate, storedTimes } = this.state;
		const dateToSend = ({
			day: controlDate.date(),
			month: controlDate.month() + 1,
			year: controlDate.year()
		});

		const data = JSON.stringify({ date: dateToSend, times: storedTimes });

		apiCalls.send(data)
			.then(response => response.json())
			.then(json => console.info(JSON.stringify(json)))
			.catch(err => console.error(err));
	}

	_updateStoredTimes(index) {
		const momentTime = { hours: moment().hours(), minutes: moment().minutes() };
		if (this._validTimeEntry(momentTime, index)) {
			const storedTimes = [...this.state.storedTimes];
			storedTimes[index] = momentTime;
			this.setState({ storedTimes });
			setTodayStorage(STORAGEKEY, STORAGEDAYKEY, storedTimes);
		} else {
			// Raise clicked on the same minute
		}
	}

	_getTime(index) {
		const storedTimesLength = this._getNextTimeEntryPoint();
		if (storedTimesLength !== -1 && storedTimesLength < index) {
			return { hours: 0, minutes: 0 };
		}
		return this.state.storedTimes[index];
	}

	_getButtonString() {
		const len = this._getNextTimeEntryPoint();
		const complementString = len === -1 ? strings.send : strings.times[len].label;
		return (
			<span>
				{strings.markNow} <strong>{complementString}</strong>
			</span>
		);
	}

	_getNextTimeEntryPoint() {
		const storedTimes = [...this.state.storedTimes];
		const a = storedTimes.findIndex((element => (
			Object.keys(element).length === 0 || !('hours' in element) || !('minutes' in element)
		)));
		return a;
	}

	_validTimeEntry(time, index) {
		const storedTimes = [...this.state.storedTimes];
		if (index === 0) {
			return true;
		}
		const { hours, minutes } = storedTimes[index - 1];
		return (time.hours !== hours || time.minutes !== minutes);
	}

	_shouldSendBeAvailable() {
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

		return (this.state.storedTimes.every(isSequentialTime) || this._getNextTimeEntryPoint() !== -1);
	}

	render() {
		return (
			<div className="page-wrapper">
				<form onSubmit={e => this.onMark(e)}>
					<h2 className="current-date">
						{strings.todayDate}:{' '}
						<strong>{moment().format('L')}</strong>
					</h2>
					<div className="column">
						<div className="time-show-content">
							{[0, 1, 2, 3].map(index => (
								<StaticTime
									key={index}
									time={this._getTime(index)}
									label={strings.times[index].label}
									emphasis={index < this.state.storedTimes.length}
								/>
							))}
						</div>
					</div>
					<div className="column">
						<div className="time-management-content">
							{this._shouldSendBeAvailable() ?
								<button type="submit" className="send send-today">
									{this._getButtonString()}
								</button>
								:
								<span className="time-sent">{strings.timeSentToday}</span>
							}
						</div>
					</div>
				</form>
			</div>
		);
	}
}
