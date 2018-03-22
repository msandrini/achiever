import React from 'react';
import PropTypes from 'prop-types';

import MonthlyCalendar from '../ui/MonthlyCalendar';
import LabourStatistics from '../ui/LabourStatistics';
import TimeEntryForm from './TimeEntryForm';
import FullScreenSpinner from '../ui/FullScreenSpinner';

import { Entries } from '../../PropTypes';
import strings from '../../../shared/strings';

const TimeEntry = ({
	entries,
	selectedDate,
	selectedEntry,
	statistics,
	successMessage,
	errorMessage,
	isPersisted,
	isLoading,
	onDateChange,
	onChangeEntry,
	onSubmit
}) => (
	<React.Fragment>
		<FullScreenSpinner active={isLoading} />

		<div className="column column-nav">
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
		<div className="column column-actions">
			<h2 className="current-date">
				{strings.selectedDate}:{' '}
				<strong>{selectedDate ? selectedDate.format('L') : ''}</strong>
			</h2>
			<main>
				<TimeEntryForm
					entry={selectedEntry}
					isDisabled={false}
					isPersisted={isPersisted}
					successMessage={successMessage}
					errorMessage={errorMessage}
					onChangeEntry={onChangeEntry}
					onSubmit={onSubmit}
				/>
			</main>
		</div>
	</React.Fragment>
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
	successMessage: PropTypes.string,
	errorMessage: PropTypes.string,
	isPersisted: PropTypes.bool,
	isLoading: PropTypes.bool,
	onDateChange: PropTypes.func,
	onChangeEntry: PropTypes.func,
	onSubmit: PropTypes.func
};

TimeEntry.defaultProps = {
	entries: [{}],
	selectedDate: {},
	selectedEntry: {},
	statistics: {},
	successMessage: '',
	errorMessage: '',
	isPersisted: false,
	isLoading: false,
	onDateChange: () => {},
	onChangeEntry: () => {},
	onSubmit: () => {}
};

export default TimeEntry;
