import React from 'react';
import DatePicker from 'react-datepicker';
import { Link } from 'react-router-dom';
import moment from 'moment';

import 'react-datepicker/dist/react-datepicker.css';

import apiCalls from '../apiCalls';
import TimeGroup from './edit/TimeGroup';
import {
	STORAGEDAYKEY,
	STORAGEKEY,
	setTodayStorage,
	getTodayStorage,
	timeIsValid,
	areTheSameDay,
	replacingValueInsideArray
} from '../../shared/utils';
import strings from '../../shared/strings';

const referenceHours = [9, 12, 13, 17];

export default class Main extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			controlDate: moment(),
			labouredHoursOnDay: null,
			remainingHoursOnWeek: null,
			storedTimes: [{}, {}, {}, {}],
			focusedField: null,
			shouldHaveFocus: null
		};
		this.onDateChange = this.onDateChange.bind(this);
		this.onTimeSet = this.onTimeSet.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
		this.imReligious = this.imReligious.bind(this);

		this.submitButton = null;
	}

	componentWillMount() {
		this._checkPreEnteredValues();
		this.setState({ storedTimes: getTodayStorage(STORAGEKEY, STORAGEDAYKEY) });
	}

	onDateChange(date) {
		this.setState({
			controlDate: date
		});
		this._checkPreEnteredValues();
	}

	onTimeSet(groupIndex) {
		return (hours, minutes) => {
			const composedTime = { hours, minutes };
			this.setState((prevState) => {
				const newState = {
					...prevState,
					storedTimes: replacingValueInsideArray(
						prevState.storedTimes,
						groupIndex,
						composedTime
					)
				};
				if (areTheSameDay(prevState.controlDate, moment())) {
					setTodayStorage(STORAGEKEY, STORAGEDAYKEY, newState.storedTimes);
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

	onSubmit(event) {
		event.preventDefault();
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

	imReligious() {
		this.onTimeSet(0)(8, 15);
		this.onTimeSet(1)(12, 15);
		this.onTimeSet(2)(13, 15);
		this.onTimeSet(3)(17, 15);
	}

	_checkPreEnteredValues() {
		// TODO check server for pre-entered values
		// populate labouredHoursOnDay and remainingHoursOnWeek
		this.setState();
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

	_shouldHaveFocus(index) {
		const { shouldHaveFocus } = this.state;
		if (shouldHaveFocus && shouldHaveFocus.index === index) {
			return shouldHaveFocus.fieldMode;
		}
		return false;
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

		return this.state.storedTimes.every(isSequentialTime);
	}

	render() {
		const {
			controlDate,
			labouredHoursOnDay,
			remainingHoursOnWeek,
			storedTimes
		} = this.state;

		return (
			<form onSubmit={this.onSubmit}>
				<h1 className="current-date">{controlDate.format('L')}</h1>
				<div className="column">
					<div className="time-management-content">
						<DatePicker
							inline
							selected={this.state.controlDate}
							onChange={this.onDateChange}
						/>
						<p className="remaining">
							{strings.remainingHoursOnWeek}
							{' '}
							<strong>{remainingHoursOnWeek}</strong>
						</p>
						{ labouredHoursOnDay ?
							(
								<p className="projection">
									{strings.hoursLabouredOnThisDay}
									{' '}
									<strong>{labouredHoursOnDay}</strong>
								</p>
							) : null
						}
					</div>
				</div>
				<div className="column">
					<div className="time-management-content">
						{referenceHours.map((refHour, index) => (
							<TimeGroup
								key={refHour}
								label={strings.times[index].label}
								emphasis={index === 0 || index === 3}
								referenceHour={refHour}
								time={storedTimes[index]}
								shouldHaveFocus={this._shouldHaveFocus(index)}
								onSet={this.onTimeSet(index)}
								onFocus={this.onFieldFocus(index)}
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
						<Link to="/today" className="changeRouteLink">Today</Link>
						<button
							type="button"
							onClick={this.imReligious}
							className="test"
							style={{
								fontSize: '11px',
								display: 'block',
							}}
						>
						Test
						</button>
					</div>
				</div>
			</form>
		);
	}
}
