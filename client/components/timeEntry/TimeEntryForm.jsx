import React from 'react';
import PropTypes from 'prop-types';

import Panel from '../ui/Panel';
import Button from '../ui/Button';
import InputTime from '../ui/InputTime';

import strings from '../../../shared/strings';
import { Entries } from '../../PropTypes';

const headers = {
	START_TIME: 0,
	START_BREAK_TIME: 1,
	END_BREAK_TIME: 2,
	END_TIME: 3
};

const TimeEntryForm = ({
	entry,
	isDisabled,
	onChangeEntry
}) => (
	<div className="TimeEntryForm">
		<Panel message="Success message" type="success" />
		<Panel message="Error message" type="error" />
		<p>{entry.isVacation ? strings.vacation : ''}</p>
		<p>{entry.holiday ? entry.holiday : ''}</p>
		<InputTime
			label={strings.times[headers.START_TIME].label}
			value={entry.startTime}
			isDisabled={isDisabled}
			isHidden={entry.isHoliday || entry.isVacation}
			onChangeTime={startTime => onChangeEntry({ ...entry, startTime })}
		/>
		<InputTime
			label={strings.times[headers.START_BREAK_TIME].label}
			value={entry.startBreakTime}
			isDisabled={isDisabled}
			isHidden={entry.isHoliday || entry.isVacation}
			onChangeTime={startBreakTime => onChangeEntry({ ...entry, startBreakTime })}
		/>
		<InputTime
			label={strings.times[headers.END_BREAK_TIME].label}
			value={entry.endBreakTime}
			isDisabled={isDisabled}
			isHidden={entry.isHoliday || entry.isVacation}
			onChangeTime={endBreakTime => onChangeEntry({ ...entry, endBreakTime })}
		/>
		<InputTime
			label={strings.times[headers.END_TIME].label}
			value={entry.endTime}
			isDisabled={isDisabled}
			isHidden={entry.isHoliday || entry.isVacation}
			onChangeTime={endTime => onChangeEntry({ ...entry, endTime })}
		/>
		<Button label={strings.send} isHidden={entry.isHoliday || entry.isVacation} />
	</div>
);

export default TimeEntryForm;

TimeEntryForm.propTypes = {
	entry: Entries,
	isDisabled: PropTypes.bool,
	onChangeEntry: PropTypes.func
};

TimeEntryForm.defaultProps = {
	entry: {},
	isDisabled: false,
	onChangeEntry: () => {}
};
