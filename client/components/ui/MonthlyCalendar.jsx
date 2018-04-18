import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';

import { isDayAfterToday } from '../../utils';

import './MonthlyCalendar.styl';

const _getStyleClassForCalendarDays = (timeEntries) => {
	const checked = [];
	const unchecked = [];
	const futureDay = [];

	const holidays = [];
	const vacations = [];
	const otanjoubis = [];
	const absences = [];

	timeEntries.forEach((dayEntry) => {
		const day = moment(dayEntry.date);

		if (dayEntry.isHoliday) {
			holidays.push(day);
		} else if (dayEntry.isVacation) {
			vacations.push(day);
		} else if (dayEntry.isOtanjoubi) {
			otanjoubis.push(day);
		} else if (dayEntry.isJustifiedAbsence) {
			absences.push(day);
		} else if (dayEntry.total && dayEntry.total !== '0:00') {
			checked.push(day);
		} else {
			unchecked.push(day);
		}

		if (isDayAfterToday(day)) {
			futureDay.push(day);
		}
	});

	return [
		{ 'calendar-checked': checked },
		{ 'calendar-unchecked': unchecked },
		{ 'calendar-holiday': holidays },
		{ 'calendar-vacation': vacations },
		{ 'calendar-otanjoubi': otanjoubis },
		{ 'calendar-absence': absences },
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
	selectedDate: PropTypes.object,
	onDateChange: PropTypes.func,
	timeEntries: PropTypes.array
};

MonthlyCalendar.defaultProps = {
	selectedDate: {},
	onDateChange: () => {},
	timeEntries: []
};

export default MonthlyCalendar;
