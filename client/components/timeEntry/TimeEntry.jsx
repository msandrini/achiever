import React from 'react';
import PropTypes from 'prop-types';
import TimeDuration from 'time-duration';

import MonthlyCalendar from '../ui/MonthlyCalendar';
import LabourStatistics from '../ui/LabourStatistics';
import TimeEntryForm from './TimeEntryForm';

import {
	Entries,
	Phases,
	Activities
} from '../../PropTypes';
import strings from '../../../shared/strings';

const formatValue = value => (new TimeDuration(value)).toMinutes();

const TimeEntry = ({
	entries,
	selectedDate,
	selectedEntry,
	phases,
	activities,
	onDateChange
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
					onDateChange={onDateChange}
				/>
				<LabourStatistics
					dayBalance={formatValue(selectedEntry.total)}
					weekBalance={formatValue(selectedEntry.weekBalance)}
					totalBalance={formatValue(selectedEntry.balance)}
					contractedTime={formatValue(selectedEntry.contractedTime)}
					weekDay={selectedDate.isoWeekday()}
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
	entries: PropTypes.arrayOf(Entries),
	selectedDate: PropTypes.object,
	selectedEntry: Entries,
	phases: Phases,
	activities: Activities,
	onDateChange: PropTypes.func
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
	},
	onDateChange: null
};
