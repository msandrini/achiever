import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import DatePicker from 'react-datepicker';

import {
	isDayBlockedInPast,
	isDayAfterToday
} from '../../utils';

import './MonthlyCalendar.styl';

const _getStyleClassForCalendarDays = (weekEntries = {}) => {
	const dayStyles = [
		{ 'calendar-checked': [] },
		{ 'calendar-unchecked': [] },
		{ 'calendar-locked': [] },
		{ 'calendar-future-day': [] }
	];
	if (weekEntries.timeEntries) {
		const weekDayNumbers = [1, 2, 3, 4, 5];
		weekDayNumbers.forEach((day) => {
			const dayEntries = weekEntries.timeEntries[day];
			const elementToPush = dayEntries.total ?
				dayStyles[0]['calendar-checked'] :
				dayStyles[1]['calendar-unchecked'];

			const dayMoment = moment(dayEntries.date);

			elementToPush.push(dayMoment);

			if (isDayBlockedInPast(dayMoment)) {
				dayStyles[2]['calendar-locked'].push(dayMoment);
			}
			if (isDayAfterToday(dayMoment)) {
				dayStyles[3]['calendar-future-day'].push(dayMoment);
			}

		});
	}
	return dayStyles;
};

const MonthlyCalendar = ({ controlDate, onDateChange, weekEntries }) => (
	<DatePicker
		inline
		highlightDates={_getStyleClassForCalendarDays(weekEntries)}
		selected={controlDate}
		onChange={onDateChange}
		filterDate={date => date.isSameOrBefore(moment(), 'day')}
		maxTime={moment()}
	/>
);

MonthlyCalendar.propTypes = {
	controlDate: PropTypes.object.isRequired,
	onDateChange: PropTypes.func,
	weekEntries: PropTypes.object
};

MonthlyCalendar.defaultProps = {
	onDateChange: () => {},
	weekEntries: {}
};

export default MonthlyCalendar;
