import React from 'react';
import PropTypes from 'prop-types';

import Panel from '../ui/Panel';
import Button from '../ui/Button';
import InputTime from '../ui/InputTime';
import SelectGroup from '../ui/SelectGroup';

import strings from '../../../shared/strings';
import { Entries } from '../../PropTypes';

const _isSpecialCases = (activities, selectedActivity) =>
	!activities.includes(selectedActivity);

const TimeEntryForm = ({
	data,
	phases,
	activities,
	selectedPhase,
	selectedActivity,
	isDisabled,
	onChangePhase,
	onChangeActivity
}) => (
	<div className="TimeEntryForm">
		<Panel message="Success message" type="success" />
		<Panel message="Error message" type="error" />
		<SelectGroup
			label={strings.projectPhase}
			options={phases}
			selected={selectedPhase}
			onChange={onChangePhase}
			showTextInstead={phases.length <= 1 ? selectedPhase : null}
			isDisabled={isDisabled}
		/>
		<SelectGroup
			label={strings.activity}
			options={activities}
			selected={selectedActivity}
			onChange={onChangeActivity}
			showTextInstead={_isSpecialCases(activities, selectedActivity) ? selectedActivity : null}
			isDisabled={isDisabled}
		/>
		<InputTime
			label={strings.times[0].label}
			value={data.startTime}
			isDisabled={isDisabled}
			isHidden={_isSpecialCases(activities, selectedActivity)}
		/>
		<InputTime
			label={strings.times[1].label}
			value={data.startBreakTime}
			isDisabled={isDisabled}
			isHidden={_isSpecialCases(activities, selectedActivity)}
		/>
		<InputTime
			label={strings.times[2].label}
			value={data.endBreakTime}
			isDisabled={isDisabled}
			isHidden={_isSpecialCases(activities, selectedActivity)}
		/>
		<InputTime
			label={strings.times[3].label}
			value={data.endTime}
			isDisabled={isDisabled}
			isHidden={_isSpecialCases(activities, selectedActivity)}
		/>
		<Button label={strings.send} isHidden={_isSpecialCases(activities, selectedActivity)} />
	</div>
);

export default TimeEntryForm;

TimeEntryForm.propTypes = {
	data: Entries,
	phases: PropTypes.arrayOf(PropTypes.string),
	activities: PropTypes.arrayOf(PropTypes.string),
	selectedPhase: PropTypes.string,
	selectedActivity: PropTypes.string,
	isDisabled: PropTypes.bool,
	onChangePhase: PropTypes.func,
	onChangeActivity: PropTypes.func
};

TimeEntryForm.defaultProps = {
	data: {},
	phases: {},
	activities: {},
	selectedPhase: null,
	selectedActivity: null,
	isDisabled: false,
	onChangePhase: () => {},
	onChangeActivity: () => {}
};
