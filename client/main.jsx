import React from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'whatwg-fetch';

import 'react-datepicker/dist/react-datepicker.css';

import TimeGroup from './components/TimeGroup';
import { timeIsValid } from '../shared/utils';
import strings from './strings';

import './styles/main.css';


moment.locale('pt-br');

export default class Main extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			controlDate: moment(),
			labouredHoursOnDay: null,
			remainingHoursOnWeek: null,
			storedTimes: [{}, {}, {}, {}]
		};
		this.onDateChange = this.onDateChange.bind(this);
		this.onTimeSet = this.onTimeSet.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
		this.imReligious = this.imReligious.bind(this);
	}

	componentWillMount() {
		this._checkPreEnteredValues();
	}

	onDateChange(date) {
		this.setState({
			controlDate: date
		});
		this._checkPreEnteredValues();
	}

	onTimeSet(groupIndex) {
		return (hours, minutes) => {
			this.setState(prevState => ({
				...prevState,
				storedTimes: [
					...prevState.storedTimes.slice(0, groupIndex),
					{ hours, minutes },
					...prevState.storedTimes.slice(groupIndex + 1)
				]
			}));
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

		fetch('/times', { method: 'post', body: data, headers: { 'Content-Type': 'application/json' } })
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
		this.setState({
			storedTimes: [{}, {}, {}, {}]
		});
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
				<h1>{strings.appName}</h1>
				<div className="column">
					<DatePicker
						inline
						selected={this.state.controlDate}
						onChange={this.onDateChange}
					/>
					<p className="remaining">
						{strings.remaining}
						{' '}
						<strong>{remainingHoursOnWeek}</strong>
					</p>
					{ labouredHoursOnDay ?
						(
							<p className="projection">
								{strings.projection}
								{' '}
								<strong>{labouredHoursOnDay}</strong>
							</p>
						) : null
					}
				</div>
				<div className="column">
					<h2>{controlDate.format('L')}</h2>
					<TimeGroup
						label={strings.labelTime1}
						emphasis
						referenceHour={9}
						time={storedTimes[0]}
						onSet={this.onTimeSet(0)}
					/>
					<TimeGroup
						label={strings.labelTime2}
						referenceHour={12}
						time={storedTimes[1]}
						onSet={this.onTimeSet(1)}
					/>
					<TimeGroup
						label={strings.labelTime3}
						referenceHour={13}
						time={storedTimes[2]}
						onSet={this.onTimeSet(2)}
					/>
					<TimeGroup
						label={strings.labelTime4}
						emphasis
						referenceHour={17}
						time={storedTimes[3]}
						onSet={this.onTimeSet(3)}
					/>
					<button type="button" onClick={this.imReligious} className="send">
						{strings.imReligious}
					</button>
					<button type="submit" className="send" disabled={!this._shouldSendBeAvailable()}>
						{strings.send}
					</button>
				</div>
			</form>

		);
	}
}
