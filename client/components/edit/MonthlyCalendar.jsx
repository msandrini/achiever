import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import DatePicker from 'react-datepicker';

import {
	isDayBlockedInPast,
	isDayAfterToday
} from '../../utils';
import DB from '../../db';

import './MonthlyCalendar.styl';

const _getStyleClassForCalendarDays = async () => {
	let allEntries = [];
	try {
		const db = await DB('entries', 'date');
		allEntries = await db.getAll();
	} catch (e) {
		console.error(e);
	}

	const dayStyles = [
		{ 'calendar-checked': [] },
		{ 'calendar-unchecked': [] },
		{ 'calendar-locked': [] },
		{ 'calendar-future-day': [] }
	];
	if (allEntries) {
		allEntries.forEach((day) => {
			const elementToPush = day.paidTime ?
				dayStyles[0]['calendar-checked'] :
				dayStyles[1]['calendar-unchecked'];

			const dayMoment = moment(day.date);

			elementToPush.push(dayMoment);

			// if (isDayBlockedInPast(dayMoment)) {
			// 	dayStyles[2]['calendar-locked'].push(dayMoment);
			// }
			if (isDayAfterToday(dayMoment)) {
				dayStyles[3]['calendar-future-day'].push(dayMoment);
			}

		});
	}
	return dayStyles;
};

class MonthlyCalendar extends React.Component {
	constructor() {
		super();
		this.state = {
			calendarStyle: []
		};
	}

	async componentWillMount() {
		const calendarStyle = await _getStyleClassForCalendarDays();
		this.setState({ calendarStyle });
	}

	render() {
		const { controlDate, onDateChange } = this.props;
		return (
			<DatePicker
				inline
				highlightDates={this.state.calendarStyle}
				selected={controlDate}
				onChange={onDateChange}
				filterDate={date => date.isSameOrBefore(moment(), 'day')}
				maxTime={moment()}
			/>
		)
	}
};

MonthlyCalendar.propTypes = {
	controlDate: PropTypes.object.isRequired,
	onDateChange: PropTypes.func
};

MonthlyCalendar.defaultProps = {
	onDateChange: () => {}
};

export default MonthlyCalendar;
