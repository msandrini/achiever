import React from 'react';
import PropTypes from 'prop-types';

import Panel from '../ui/Panel';
import Button from '../ui/Button';
import InputTime from '../ui/InputTime';
import SelectGroup from '../ui/SelectGroup';

import strings from '../../../shared/strings';

const TimeEntryForm = ({ dayEntry, phases, activities }) => (
	<div className="TimeEntryForm">
		<Panel message="Success message" type="success" />
		<Panel message="Error message" type="error" />
		<SelectGroup
			label={strings.projectPhase}
			options={phases.options}
			selected={dayEntry.phase || phases.default}
			onChange={() => {}}
			isDisabled={false}
		/>
		<SelectGroup
			label={strings.activity}
			options={activities.options}
			selected={dayEntry.activity || activities.default}
			onChange={() => {}}
			isDisabled={false}
		/>
		<InputTime
			label={strings.times[0].label}
			value={dayEntry.startTime}
			isDisabled={false}
		/>
		<InputTime
			label={strings.times[1].label}
			value={dayEntry.startBreakTime}
			isDisabled={false}
		/>
		<InputTime
			label={strings.times[2].label}
			value={dayEntry.endBreakTime}
			isDisabled={false}
		/>
		<InputTime
			label={strings.times[3].label}
			value={dayEntry.endTime}
			isDisabled={false}
		/>
		<Button label={strings.send} />
	</div>
);

export default TimeEntryForm;

TimeEntryForm.propTypes = {
	dayEntry: PropTypes.shape({
		date: PropTypes.string,
		phase: PropTypes.string,
		activity: PropTypes.string,
		startTime: PropTypes.string,
		startBreakTime: PropTypes.string,
		endBreakTime: PropTypes.string,
		endTime: PropTypes.string,
		total: PropTypes.string
	}),
	phases: PropTypes.shape({
		default: PropTypes.number,
		options: PropTypes.arrayOf(PropTypes.shape({
			id: PropTypes.number,
			name: PropTypes.string
		}))
	}),
	activities: PropTypes.shape({
		default: PropTypes.number,
		options: PropTypes.arrayOf(PropTypes.shape({
			id: PropTypes.number,
			name: PropTypes.string
		}))
	})
};

TimeEntryForm.defaultProps = {
	dayEntry: {},
	phases: {},
	activities: {}
};
