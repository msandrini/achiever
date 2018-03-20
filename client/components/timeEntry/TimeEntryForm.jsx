import React from 'react';
import PropTypes from 'prop-types';

import Panel from '../ui/Panel';
import Button from '../ui/Button';
import InputTime from '../ui/InputTime';

import strings from '../../../shared/strings';
import { Entries } from '../../PropTypes';

const TimeEntryForm = ({
	data,
	isDisabled
}) => (
	<div className="TimeEntryForm">
		<Panel message="Success message" type="success" />
		<Panel message="Error message" type="error" />
		<p>{data.isVacation ? strings.vacation : ''}</p>
		<p>{data.holiday ? data.holiday : ''}</p>
		<InputTime
			label={strings.times[0].label}
			value={data.startTime}
			isDisabled={isDisabled}
			isHidden={data.isHoliday || data.isVacation}
		/>
		<InputTime
			label={strings.times[1].label}
			value={data.startBreakTime}
			isDisabled={isDisabled}
			isHidden={data.isHoliday || data.isVacation}
		/>
		<InputTime
			label={strings.times[2].label}
			value={data.endBreakTime}
			isDisabled={isDisabled}
			isHidden={data.isHoliday || data.isVacation}
		/>
		<InputTime
			label={strings.times[3].label}
			value={data.endTime}
			isDisabled={isDisabled}
			isHidden={data.isHoliday || data.isVacation}
		/>
		<Button label={strings.send} isHidden={data.isHoliday || data.isVacation} />
	</div>
);

export default TimeEntryForm;

TimeEntryForm.propTypes = {
	data: Entries,
	isDisabled: PropTypes.bool
};

TimeEntryForm.defaultProps = {
	data: {},
	isDisabled: false
};
