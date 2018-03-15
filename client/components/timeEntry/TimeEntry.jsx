import React from 'react';
import PropTypes from 'prop-types';

import MonthlyCalendar from '../ui/MonthlyCalendar';
import LabourStatistics from '../ui/LabourStatistics';
import TimeEntryForm from './TimeEntryForm';

import { Entries } from '../../PropTypes';
import strings from '../../../shared/strings';

const TimeEntry = ({
	entries,
	selectedDate,
	selectedEntry,
	selectedPhase,
	selectedActivity,
	statistics,
	phases,
	activities,
	onDateChange,
	isSpecialCase
}) => (
	<div className="TimeEntry">
		<h2 className="current-date">
			{strings.selectedDate}: <strong>{selectedDate ? selectedDate.format('L') : ''}</strong>
		</h2>

		<div className="columns">
			<div className="column column-half column-right-aligned">
				<MonthlyCalendar
					selectedDate={selectedDate}
					timeEntries={entries}
					onDateChange={onDateChange}
				/>
				<LabourStatistics
					dayBalance={statistics.dayBalance}
					weekBalance={statistics.weekBalance}
					totalBalance={statistics.totalBalance}
					contractedTime={statistics.contractedTime}
					weekDay={statistics.weekDay}
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
					isSpecialCase={isSpecialCase}
					onChangePhase={() => {}}
					onChangeActivity={() => {}}
				/>
			</div>
		</div>
	</div>
);

TimeEntry.propTypes = {
	entries: PropTypes.arrayOf(Entries),
	selectedDate: PropTypes.object,
	selectedEntry: Entries,
	selectedPhase: PropTypes.string,
	selectedActivity: PropTypes.string,
	statistics: PropTypes.shape({
		dayBalance: PropTypes.number,
		weekBalance: PropTypes.number,
		totalBalance: PropTypes.number,
		contractedTime: PropTypes.number,
		weekDay: PropTypes.number
	}),
	phases: PropTypes.arrayOf(PropTypes.string),
	activities: PropTypes.arrayOf(PropTypes.string),
	isSpecialCase: PropTypes.bool,
	onDateChange: PropTypes.func
};

TimeEntry.defaultProps = {
	entries: [{}],
	selectedDate: {},
	selectedEntry: {},
	selectedPhase: null,
	selectedActivity: null,
	statistics: {},
	isSpecialCase: false,
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

export default TimeEntry;
