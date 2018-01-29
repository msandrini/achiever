import React from 'react';

import PropTypes from 'prop-types';

import SelectGroup from './SelectGroup';

import {
	SPECIAL_ACTIVITY_HOLIDAY
} from '../../utils';

import strings from '../../../shared/strings';

const ActiveDayTasks = (props) => {
	const {
		selectedActivity,
		selectedPhase,
		isHoliday,
		onPhaseSelect,
		tabIndex,
		disable,
		onActivitySelect,
		projectPhasesQuery
	} = props;

	const projectPhases = projectPhasesQuery.phases || {};

	let alternativeTextForProjectPhase = projectPhases.options ? null : strings.loading;
	if (projectPhases.options && projectPhases.options.length === 1) {
		alternativeTextForProjectPhase = projectPhases.options[0].name;
	}

	const activityOptions = selectedPhase.activities.options ? selectedPhase.activities.options : [];
	let alternativeTextForActivity = projectPhases.options ? null : strings.loading;
	if (isHoliday) {
		alternativeTextForActivity = SPECIAL_ACTIVITY_HOLIDAY.name;
	}

	return (
		<div className="active-day-tasks">
			<SelectGroup
				name="projectPhase"
				label={strings.projectPhase}
				options={projectPhases.options}
				selected={selectedPhase.id}
				onChange={onPhaseSelect(projectPhases.options)}
				showTextInstead={alternativeTextForProjectPhase}
				tabIndex={tabIndex}
				disabled={disable}
			/>
			<SelectGroup
				name="activity"
				label={strings.activity}
				options={activityOptions}
				selected={selectedActivity.id}
				onChange={onActivitySelect(selectedPhase.activities.options)}
				showTextInstead={alternativeTextForActivity}
				tabIndex={tabIndex + 1}
				disabled={disable}
			/>
		</div>
	);
};

export default ActiveDayTasks;

ActiveDayTasks.propTypes = {
	disable: PropTypes.bool,
	isHoliday: PropTypes.bool,
	onPhaseSelect: PropTypes.func.isRequired,
	onActivitySelect: PropTypes.func.isRequired,
	projectPhasesQuery: PropTypes.object.isRequired,
	selectedActivity: PropTypes.object.isRequired,
	selectedPhase: PropTypes.object.isRequired,
	tabIndex: PropTypes.number
};

ActiveDayTasks.defaultProps = {
	disable: false,
	isHoliday: false,
	tabIndex: 0
};
