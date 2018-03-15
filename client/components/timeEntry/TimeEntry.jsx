import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import TimeDuration from 'time-duration';

import MonthlyCalendar from '../ui/MonthlyCalendar';
import LabourStatistics from '../ui/LabourStatistics';
import TimeEntryForm from './TimeEntryForm';

import {
	TimeData,
	Phases,
	Activities
} from '../../PropTypes';
import strings from '../../../shared/strings';

/*
+---TimeEntry
    +---MonthlyCalendar
	+---LabourStatistics
		+---Gauge
        	+---GaugeBar
        	+---GaugeDescription
    +---TimeEntryForm
        +---MessagePanel
        +---SelectGroup
		+---InputTime
        +---Button
    +---WeeklyCalendar
*/

const formatValue = value => (new TimeDuration(value)).toMinutes();

const TimeEntry = ({
	entries,
	selectedDate,
	selectedEntry,
	phases,
	activities
}) => (
	<div className="TimeEntry">
		<h2 className="current-date">
			{strings.selectedDate}: <strong>{selectedDate.format('L')}</strong>
		</h2>

		<div className="columns">
			<div className="column column-half column-right-aligned">
				<MonthlyCalendar
					selectedDate={selectedDate}
					timeEntries={entries}
				/>
				<LabourStatistics
					dayBalance={formatValue(selectedEntry.total)}
					weekBalance={formatValue(selectedEntry.total)}
					totalBalance={formatValue(selectedEntry.balance)}
					contractedTime={formatValue(selectedEntry.contractedTime)}
					weekDay={moment().isoWeekday()}
				/>
			</div>
			<div className="column column-half">
				<TimeEntryForm
					data={selectedEntry}
					phases={phases}
					activities={activities}
				/>
			</div>
		</div>
	</div>
);

export default TimeEntry;

TimeEntry.propTypes = {
	entries: PropTypes.arrayOf(TimeData),
	selectedDate: PropTypes.object,
	selectedEntry: TimeData,
	phases: Phases,
	activities: Activities
};

TimeEntry.defaultProps = {
	entries: [{}],
	selectedDate: {},
	selectedEntry: {},
	phases: {
		default: 0,
		options: []
	},
	activities: {
		default: 0,
		options: []
	}
};
