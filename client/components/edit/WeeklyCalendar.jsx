import React from 'react';
import PropTypes from 'prop-types';
import BigCalendar from 'react-big-calendar';
import moment from 'moment';
import TimeDuration from 'time-duration';

import 'react-big-calendar/lib/css/react-big-calendar.css';

import strings from '../../../shared/strings';

import '../../styles/weeklyCalendar.styl';

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
	const _isEmptyObj = obj => (
		Object.keys(obj).length === 0 ? 0 : obj
	);
	const dayEntry = {
		...timeEntryAtIndex,
		startTime: new TimeDuration(_isEmptyObj(storedTimes[0])).toString(),
		startBreakTime: new TimeDuration(_isEmptyObj(storedTimes[1])).toString(),
		endBreakTime: new TimeDuration(_isEmptyObj(storedTimes[2])).toString(),
		endTime: new TimeDuration(_isEmptyObj(storedTimes[3])).toString()
	};
	return dayEntry;
};

const _convertweekEntriesToEvents = (weekEntries, controlDate, storedTimes) => {
	const emptyValidReturn = [{}];
	if (weekEntries.timeEntries) {
		const events = [];
		[0, 1, 2, 3, 4, 5, 6].forEach((index) => {
			const dayEntry = weekEntries.timeEntries[index].date === controlDate.format('YYYY-MM-DD') ?
				_storedTimesToDayEntry(storedTimes, weekEntries.timeEntries[index]) :
				weekEntries.timeEntries[index];

			if (dayEntry) {
				const hasBreak = dayEntry.startBreakTime && dayEntry.endBreakTime;
				if (hasBreak) {
					events.push({
						id: index * 2,
						start: _getDateFromComposedObj(dayEntry, 'startTime'),
						end: _getDateFromComposedObj(dayEntry, 'startBreakTime'),
						title: `${dayEntry.phase} - ${dayEntry.activity}`
					});
					events.push({
						id: (index * 2) + 1,
						start: _getDateFromComposedObj(dayEntry, 'endBreakTime'),
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

const WeeklyCalendar = ({ weekEntries, controlDate, storedTimes }) => (
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
			events={_convertweekEntriesToEvents(weekEntries, controlDate, storedTimes)}
		/>
	</details>
);

WeeklyCalendar.propTypes = {
	controlDate: PropTypes.object,
	weekEntries: PropTypes.object,
	storedTimes: PropTypes.array
};

WeeklyCalendar.defaultProps = {
	controlDate: {},
	weekEntries: {},
	storedTimes: []
};

export default WeeklyCalendar;
