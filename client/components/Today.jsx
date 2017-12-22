/* global window */
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import StaticTime from './today/StaticTime';
import strings from '../../shared/strings';
import {
	STORAGEDAYKEY,
	STORAGEKEY,
	setTodayStorage,
	getTodayStorage,
	submitToServer
} from './shared/utils';
import { timeIsValid } from '../../shared/utils';

import '../styles/today.styl';


const isEmptyObject = obj => (
	Object.keys(obj).length === 0
);

const getNextEmptyObjectOnArray = arr => (
	arr.findIndex((element => (
		isEmptyObject(element) || !('hours' in element) || !('minutes' in element)
	)))
);

const isValidTime = (times) => {
	let comparisonTerm = 0;
	const isSequentialTime = (time) => {
		if (isEmptyObject(time)) {
			return true;
		}
		if (time && timeIsValid(time)) {
			const date = new Date(2017, 0, 1, time.hours, time.minutes, 0, 0);
			const isLaterThanComparison = date > comparisonTerm;
			comparisonTerm = Number(date);
			return isLaterThanComparison;
		}
		return false;
	};
	return times.every(isSequentialTime);
};

const ADD_TIME_ENTRY_MUTATION = gql`
  mutation addTimeEntry($timeEntry: TimeEntryInput!) {
	addTimeEntry(timeEntry: $timeEntry) {
	  date
	  employeeName
	  startTime
	  startBreakTime
	  endBreakTime
	  endTime
	  total
	}
  }
`;


class Today extends React.Component {
	constructor() {
		super();
		this.state = {
			storedTimes: [{}, {}, {}, {}],
			sentToday: false
		};
		this.onMark = this.onMark.bind(this);
		this._avoidDoubleClick = this._avoidDoubleClick.bind(this);
		this._getButtonString = this._getButtonString.bind(this);
		this._getNextTimeEntryPoint = this._getNextTimeEntryPoint.bind(this);
		this._shouldButtonBeAvailable = this._shouldButtonBeAvailable.bind(this);
	}

	componentWillMount() {
		const { storedTimes, sentToday } = getTodayStorage(STORAGEKEY, STORAGEDAYKEY);
		if (!sentToday) {
			if (getNextEmptyObjectOnArray(storedTimes) === -1) {
				if (isValidTime(storedTimes)) {
					const reply = window.confirm(strings.confirmSave);
					if (reply) {
						this.setState((prevState) => {
							const newState = { ...prevState, storedTimes, sentToday: true };
							submitToServer(newState, this.props.addTimeEntry);
							setTodayStorage(STORAGEKEY, STORAGEDAYKEY, { storedTimes, sentToday: true });
							return newState;
						});
					} else {
						this.context.router.history.goBack();
					}
				} else {
					window.alert(strings.invalidTime);
					this.context.router.history.goBack();
				}
			}
		}
		this.setState({ storedTimes, sentToday });
	}

	onMark(event) {
		event.preventDefault();

		const momentTime = { hours: moment().hours(), minutes: moment().minutes() };
		const index = this._getNextTimeEntryPoint();

		if (this._avoidDoubleClick(momentTime, index)) {
			const { storedTimes, sentToday } = this.state;
			storedTimes[index] = momentTime;
			if (isValidTime(storedTimes)) {
				setTodayStorage(STORAGEKEY, STORAGEDAYKEY, { storedTimes, sentToday });
				this.setState((prevState) => {
					const newState = { ...prevState, storedTimes, sentToday };
					if (index === 3) {
						submitToServer(newState, this.props.addTimeEntry);
					}
					return newState;
				});
			} else {
				window.alert(strings.invalidAddTime);
			}
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
		return getNextEmptyObjectOnArray(storedTimes);
	}

	_avoidDoubleClick(time, index) {
		const storedTimes = [...this.state.storedTimes];
		if (index === 0) {
			return true;
		}
		const { hours, minutes } = storedTimes[index - 1];
		return (time.hours !== hours || time.minutes !== minutes);
	}

	_shouldButtonBeAvailable() {
		return this._getNextTimeEntryPoint() !== -1;
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
							{this._shouldButtonBeAvailable() ?
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

export default graphql(ADD_TIME_ENTRY_MUTATION, { name: 'addTimeEntry' })(Today);

Today.propTypes = {
	addTimeEntry: PropTypes.func.isRequired
};

Today.contextTypes = {
	router: PropTypes.object
};
