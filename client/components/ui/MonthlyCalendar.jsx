import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import DatePicker from 'react-datepicker';

import {
	isDayBlockedInPast,
	isDayAfterToday
} from '../../utils';

import './MonthlyCalendar.styl';

const _getStyleClassForCalendarDays = (timeEntries) => {
	const checked = [];
	const unchecked = [];
	const locked = [];
	const futureDay = [];

	timeEntries.forEach((dayEntry) => {
		const day = moment(dayEntry.date);

		if (dayEntry.total) {
			checked.push(day);
		} else {
			unchecked.push(day);
		}

		if (isDayBlockedInPast(day)) {
			locked.push(day);
		}

		if (isDayAfterToday(day)) {
			futureDay.push(day);
		}
	});

	return [
		{ 'calendar-checked': checked },
		{ 'calendar-unchecked': unchecked },
		{ 'calendar-locked': locked },
		{ 'calendar-future-day': futureDay }
	];
};

const MonthlyCalendar = ({ selectedDate, onDateChange, timeEntries }) => (
	<DatePicker
		inline
		highlightDates={_getStyleClassForCalendarDays(timeEntries)}
		selected={selectedDate}
		onChange={onDateChange}
		filterDate={date => date.isSameOrBefore(moment(), 'day')}
		maxTime={moment()}
	/>
);

MonthlyCalendar.propTypes = {
	selectedDate: PropTypes.object.isRequired,
	onDateChange: PropTypes.func,
	timeEntries: PropTypes.array
};

MonthlyCalendar.defaultProps = {
	onDateChange: () => {},
	timeEntries: []
};

export default MonthlyCalendar;
