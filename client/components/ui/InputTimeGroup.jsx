import React from 'react';
import PropTypes from 'prop-types';

import InputTime from './InputTime';

import './InputTimeGroup.styl';

const InputTimeGroup = ({
	label,
	value,
	isDisabled,
	isHidden,
	onChangeTime,
	referenceHour
}) => (
	!isHidden ?
		<fieldset className="input-time-group">
			<label>
				<span className="label">{label}</span>
				<InputTime
					value={value}
					mode="hours"
					disabled={isDisabled}
					onChangeTime={onChangeTime}
					referenceHour={referenceHour}
				/>
				<span className="separator">:</span>
				<InputTime
					value={value}
					mode="minutes"
					disabled={isDisabled}
					onChangeTime={onChangeTime}
				/>
			</label>
		</fieldset> : null
);

export default InputTimeGroup;

InputTimeGroup.propTypes = {
	label: PropTypes.string.isRequired,
	value: PropTypes.string,
	isDisabled: PropTypes.bool,
	isHidden: PropTypes.bool,
	onChangeTime: PropTypes.func,
	referenceHour: PropTypes.number
};

InputTimeGroup.defaultProps = {
	value: '0:00',
	isDisabled: false,
	isHidden: false,
	onChangeTime: () => {},
	referenceHour: 8
};
