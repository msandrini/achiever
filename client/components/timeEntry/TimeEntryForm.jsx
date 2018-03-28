import React from 'react';
import PropTypes from 'prop-types';

import Panel from '../ui/Panel';
import Button from '../ui/Button';
import InputTime from '../ui/InputTime';
import ModeSelect from './ModeSelect';

import strings from '../../../shared/strings';
import { Entries } from '../../PropTypes';

const HEADERS = {
	startTime: 0,
	startBreakTime: 1,
	endBreakTime: 2,
	endTime: 3
};

const TimeEntryForm = ({
	entry,
	mode,
	isDisabled,
	successMessage,
	errorMessage,
	onChangeEntry,
	onChangeMode,
	isPersisted,
	onSubmit
}) => (
	<form className="TimeEntryForm" onSubmit={onSubmit}>
		<ModeSelect
			mode={mode}
			onSelect={onChangeMode}
		/>
		<Panel message={successMessage} type="success" />
		<Panel message={errorMessage} type="error" />
		{
			Object.keys(HEADERS).map(key => (
				<InputTime
					key={key}
					isHidden={Boolean(mode)}
					label={strings.times[HEADERS[key]].label}
					value={entry[key]}
					isDisabled={isDisabled}
					onChangeTime={time => onChangeEntry({ ...entry, [key]: time })}
				/>
			))
		}
		<Button
			label={isPersisted ? strings.update : strings.send}
		/>
	</form>
);

export default TimeEntryForm;

TimeEntryForm.propTypes = {
	entry: Entries,
	mode: PropTypes.string,
	isDisabled: PropTypes.bool,
	isPersisted: PropTypes.bool,
	successMessage: PropTypes.string,
	errorMessage: PropTypes.string,
	onChangeEntry: PropTypes.func,
	onChangeMode: PropTypes.func,
	onSubmit: PropTypes.func
};

TimeEntryForm.defaultProps = {
	entry: {},
	mode: '',
	isDisabled: false,
	isPersisted: false,
	successMessage: '',
	errorMessage: '',
	onChangeEntry: () => {},
	onChangeMode: () => {},
	onSubmit: () => {}
};
