import React from 'react';

import Panel from '../ui/Panel';
import Button from '../ui/Button';
import InputTime from '../ui/InputTime';
import SelectGroup from '../ui/SelectGroup';

import strings from '../../../shared/strings';
import {
	TimeData,
	Phases,
	Activities
} from '../../PropTypes';

const TimeEntryForm = ({ data, phases, activities }) => (
	<div className="TimeEntryForm">
		<Panel message="Success message" type="success" />
		<Panel message="Error message" type="error" />
		<SelectGroup
			label={strings.projectPhase}
			options={phases.options}
			selected={data.phase || phases.default}
			onChange={() => {}}
			isDisabled={false}
		/>
		<SelectGroup
			label={strings.activity}
			options={activities.options}
			selected={data.activity || activities.default}
			onChange={() => {}}
			isDisabled={false}
		/>
		<InputTime
			label={strings.times[0].label}
			value={data.startTime}
			isDisabled={false}
		/>
		<InputTime
			label={strings.times[1].label}
			value={data.startBreakTime}
			isDisabled={false}
		/>
		<InputTime
			label={strings.times[2].label}
			value={data.endBreakTime}
			isDisabled={false}
		/>
		<InputTime
			label={strings.times[3].label}
			value={data.endTime}
			isDisabled={false}
		/>
		<Button label={strings.send} />
	</div>
);

export default TimeEntryForm;

TimeEntryForm.propTypes = {
	data: TimeData,
	phases: Phases,
	activities: Activities
};

TimeEntryForm.defaultProps = {
	data: {},
	phases: {},
	activities: {}
};
