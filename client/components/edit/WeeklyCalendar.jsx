import React from 'react';
import PropTypes from 'prop-types';
import BigCalendar from 'react-big-calendar';
import moment from 'moment';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../styles/weeklyCalendar.styl';

BigCalendar.setLocalizer(BigCalendar.momentLocalizer(moment));

const noOp = () => () => {};

const _getDateFromComposedObj = (dateObj, entryType) => {
	const dateFormatSent = 'YYYY-MM-DD H:mm';
	return moment(`${dateObj.date} ${dateObj[entryType]}`, dateFormatSent).toDate();
};

const _convertweekEntriesToEvents = (weekEntries) => {
	const emptyValidReturn = [{}];
	if (weekEntries.timeEntries) {
		const events = [];
		[0, 1, 2, 3, 4, 5, 6].forEach((index) => {
			const dayEntry = weekEntries.timeEntries[index];
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

const WeeklyCalendar = ({ weekEntries, controlDate }) => (
	<div className="weekly-calendar">
		<BigCalendar
			view="week"
			onView={noOp}
			step={90}
			onNavigate={noOp}
			date={controlDate.toDate()}
			toolbar={false}
			selectable={false}
			events={_convertweekEntriesToEvents(weekEntries)}
		/>
	</div>
);

WeeklyCalendar.propTypes = {
	controlDate: PropTypes.object,
	weekEntries: PropTypes.object
};

WeeklyCalendar.defaultProps = {
	controlDate: {},
	weekEntries: {}
};

export default WeeklyCalendar;
