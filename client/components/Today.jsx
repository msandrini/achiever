import React from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';


import 'react-datepicker/dist/react-datepicker.css';

import StaticTime from './today/StaticTime';
import strings from '../../shared/strings';
import apiCalls from '../apiCalls';
import {
	STORAGEDAYKEY,
	STORAGEKEY,
	setTodayStorage,
	getTodayStorage
} from '../../shared/utils';

export default class Today extends React.Component {
	constructor() {
		super();
		this.state = {
			controlDate: moment(),
			storedTimes: []
		};
		this.onMark = this.onMark.bind(this);
		this._validTimeEntry = this._validTimeEntry.bind(this);
		this._getString = this._getString.bind(this);
		this._submit = this._submit.bind(this);
		this._updateStoredTimes = this._updateStoredTimes.bind(this);
	}

	componentWillMount() {
		// Check if any value was defined before
		this.setState({ storedTimes: getTodayStorage(STORAGEKEY, STORAGEDAYKEY) });
	}

	onMark(event) {
		event.preventDefault();
		if (this.state.storedTimes.length === 4) {
			this._submit();
		} else {
			this._updateStoredTimes();
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

	_updateStoredTimes() {
		const momentTime = { hours: moment().hours(), minutes: moment().minutes() };
		if (this._validTimeEntry(momentTime)) {
			const storedTimes = [...this.state.storedTimes];
			storedTimes.push(momentTime);
			this.setState({ storedTimes });
			setTodayStorage(STORAGEKEY, STORAGEDAYKEY, storedTimes);
		} else {
			// Raise - or legnth > 4 or not valid time
		}
	}

	_getTime(index) {
		if (this.state.storedTimes.length < index) {
			return { hours: 0, minutes: 0 };
		}
		return this.state.storedTimes[index];
	}

	_getString() {
		const len = [...this.state.storedTimes].length;
		const buttonString = len === 4 ? 'Enviar' : strings.times[len].label;
		return ('Marcar ', buttonString);
	}

	_validTimeEntry(time) {
		const storedTimes = [...this.state.storedTimes];
		if (storedTimes.length === 0) {
			return true;
		}
		const { hours, minutes } = storedTimes[storedTimes.length - 1];
		return ((storedTimes.length < 4) &&
			(time.hours !== hours || time.minutes !== minutes));
	}

	render() {
		return (
			<form onSubmit={e => this.onMark(e)}>
				<h1 className="current-date">{this.state.controlDate.format('L')}</h1>
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
						<button
							type="submit"
							className="send"
						>
							{this._getString()}
						</button>
						<Link to="/edit" className="changeRouteLink">Edit</Link>
					</div>
				</div>
			</form>
		);
	}
}
