import React from 'react';
import PropTypes from 'prop-types';
import BigCalendar from 'react-big-calendar';
import moment from 'moment-timezone';
import TimeDuration from 'time-duration';

import 'react-big-calendar/lib/css/react-big-calendar.css';

import strings from '../../../shared/strings';
import {
	timesAreValid,
	getTimeEntriesForWeek
} from '../../utils';

import './WeeklyCalendar.styl';


moment.locale('pt-br');
moment.tz.setDefault('America/Sao_Paulo');
BigCalendar.setLocalizer(BigCalendar.momentLocalizer(moment));

const noOp = () => () => {};


const _getDateFromComposedObj = (dateObj, entryType) => {
	const dateFormatSent = 'YYYY-MM-DD H:mm';
	return moment(`${dateObj.date} ${dateObj[entryType]}`, dateFormatSent).toDate();
};


/**
 * Given an array of stored times, create an object containing DayEntries times
 * @param {Object[]} storedTimes is an array of stored times
 */
const _storedTimesToDayEntry = (storedTimes, timeEntryAtIndex) => {
	let dayEntry = {
		...timeEntryAtIndex
	};
	if (timesAreValid(storedTimes)) {
		dayEntry = {
			...timeEntryAtIndex,
			startTime: new TimeDuration(storedTimes.startTime).toString(),
			breakStartTime: new TimeDuration(storedTimes.breakStartTime).toString(),
			breakEndTime: new TimeDuration(storedTimes.breakEndTime).toString(),
			endTime: new TimeDuration(storedTimes.endTime).toString()
		};
	}
	return dayEntry;
};

const _convertweekEntriesToEvents = (timeEntries, controlDate, storedTimes) => {
	const emptyValidReturn = [{}];
	if (timeEntries) {
		const events = [];
		[0, 1, 2, 3, 4, 5, 6].forEach((index) => {
			const dayEntry = timeEntries[index].date === controlDate.format('YYYY-MM-DD') ?
				_storedTimesToDayEntry(storedTimes, timeEntries[index]) :
				timeEntries[index];

			if (dayEntry) {
				const hasBreak = Boolean((
					dayEntry.breakStartTime &&
					dayEntry.breakStartTime !== '0:00' &&
					dayEntry.breakEndTime &&
					dayEntry.breakEndTime !== '0:00'
				));

				if (hasBreak) {
					events.push({
						id: index * 2,
						start: _getDateFromComposedObj(dayEntry, 'startTime'),
						end: _getDateFromComposedObj(dayEntry, 'breakStartTime'),
						title: `${dayEntry.phase} - ${dayEntry.activity}`
					});
					events.push({
						id: (index * 2) + 1,
						start: _getDateFromComposedObj(dayEntry, 'breakEndTime'),
						end: _getDateFromComposedObj(dayEntry, 'endTime'),
						title: `${dayEntry.phase} - ${dayEntry.activity}`
					});
				} else {
					events.push({
						id: index * 2,
						start: _getDateFromComposedObj(dayEntry, 'startTime'),
						end: _getDateFromComposedObj(dayEntry, 'endTime'),
						title: `${dayEntry.phase} - ${dayEntry.activity}`
					});
				}
			}
		});
		return events || emptyValidReturn;
	}
	return emptyValidReturn;
};

class WeeklyCalendar extends React.Component {
	constructor() {
		super();
		this.state = {
			events: [{}]
		};
	}

	async componentWillReceiveProps(nextProps) {
		const { controlDate, storedTimes } = nextProps;
		const weekEntries = await getTimeEntriesForWeek(controlDate);
		const events = _convertweekEntriesToEvents(weekEntries, controlDate, storedTimes);
		this.setState({ events });
	}

	render() {
		const { controlDate } = this.props;
		return (
			<details className="weekly-calendar">
				<summary>{strings.weeklyCalendar}</summary>
				<BigCalendar
					view="week"
					onView={noOp}
					step={90}
					onNavigate={noOp}
					date={controlDate.toDate()}
					toolbar={false}
					selectable={false}
					events={this.state.events}
				/>
			</details>
		);
	}
};

WeeklyCalendar.propTypes = {
	controlDate: PropTypes.object,
	storedTimes: PropTypes.object
};

WeeklyCalendar.defaultProps = {
	controlDate: {},
	storedTimes: {
		breakEndTime: '',
		breakStartTime: '',
		endTime: '',
		startTime: ''
	}
};

export default WeeklyCalendar;
