import React from 'react';
import PropTypes from 'prop-types';

import MonthlyCalendar from '../ui/MonthlyCalendar';
import LabourStatistics from '../ui/LabourStatistics';
import FullScreenSpinner from '../ui/FullScreenSpinner';
import AlertModal from '../ui/modals/AlertModal';

import TimeEntryForm from './TimeEntryForm';
import SpecialDayPanel from './SpecialDayPanel';
import CurrentDate from './CurrentDate';

import { Entries } from '../../PropTypes';
import strings from '../../../shared/strings';

const TimeEntry = ({
	entries,
	mode,
	selectedDate,
	selectedEntry,
	statistics,
	successMessage,
	errorMessage,
	isPersisted,
	isLoading,
	onDateChange,
	onChangeEntry,
	onChangeMode,
	onCloseAlert,
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
			<CurrentDate selectedDate={selectedDate} />
			<main>
				{(selectedEntry.isHoliday || selectedEntry.isVacation) ?
					<SpecialDayPanel
						entry={selectedEntry}
					/>
					:
					<TimeEntryForm
						mode={mode}
						entry={selectedEntry}
						isDisabled={false}
						isPersisted={isPersisted}
						successMessage={successMessage}
						errorMessage={errorMessage}
						onChangeEntry={onChangeEntry}
						onChangeMode={onChangeMode}
						onSubmit={onSubmit}
					/>
				}
			</main>
		</div>
		<AlertModal
			title={strings.success}
			active={Boolean(successMessage)}
			content={successMessage}
			onClose={onCloseAlert}
			type="success"
		/>
		<AlertModal
			title={strings.error}
			active={Boolean(errorMessage)}
			content={errorMessage}
			onClose={onCloseAlert}
			type="error"
		/>
	</React.Fragment>
);

TimeEntry.propTypes = {
	entries: PropTypes.arrayOf(Entries),
	mode: PropTypes.string,
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
	onChangeMode: PropTypes.func,
	onCloseAlert: PropTypes.func,
	onSubmit: PropTypes.func
};

TimeEntry.defaultProps = {
	entries: [{}],
	mode: '',
	selectedDate: {},
	selectedEntry: {},
	statistics: {},
	successMessage: '',
	errorMessage: '',
	isPersisted: false,
	isLoading: false,
	onDateChange: () => {},
	onChangeEntry: () => {},
	onChangeMode: () => {},
	onCloseAlert: () => {},
	onSubmit: () => {}
};

export default TimeEntry;
