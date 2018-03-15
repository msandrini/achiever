import React from 'react';
import PropTypes from 'prop-types';
import TimeDuration from 'time-duration';

import MonthlyCalendar from '../ui/MonthlyCalendar';
import LabourStatistics from '../ui/LabourStatistics';
import TimeEntryForm from './TimeEntryForm';

import { Entries } from '../../PropTypes';
import strings from '../../../shared/strings';

const formatValue = value => (new TimeDuration(value)).toMinutes();

const TimeEntry = ({
	entries,
	selectedDate,
	selectedEntry,
	selectedPhase,
	selectedActivity,
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
					selectedPhase={selectedPhase}
					selectedActivity={selectedActivity}
					isDisabled={false}
					onChangePhase={() => {}}
					onChangeActivity={() => {}}
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
	selectedPhase: PropTypes.string,
	selectedActivity: PropTypes.string,
	phases: PropTypes.arrayOf(PropTypes.string),
	activities: PropTypes.arrayOf(PropTypes.string),
	onDateChange: PropTypes.func
};

TimeEntry.defaultProps = {
	entries: [{}],
	selectedDate: {},
	selectedEntry: {},
	selectedPhase: null,
	selectedActivity: null,
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
