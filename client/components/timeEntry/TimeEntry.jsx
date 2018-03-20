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
	statistics,
	onDateChange,
	onChangeEntry
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
					entry={selectedEntry}
					isDisabled={false}
					onChangeEntry={value => onChangeEntry(value)}
				/>
			</div>
		</div>
	</div>
);

TimeEntry.propTypes = {
	entries: PropTypes.arrayOf(Entries),
	selectedDate: PropTypes.object,
	selectedEntry: Entries,
	statistics: PropTypes.shape({
		dayBalance: PropTypes.number,
		weekBalance: PropTypes.number,
		totalBalance: PropTypes.number,
		contractedTime: PropTypes.number,
		weekDay: PropTypes.number
	}),
	onDateChange: PropTypes.func,
	onChangeEntry: PropTypes.func
};

TimeEntry.defaultProps = {
	entries: [{}],
	selectedDate: {},
	selectedEntry: {},
	statistics: {},
	onDateChange: () => {},
	onChangeEntry: () => {}
};

export default TimeEntry;
