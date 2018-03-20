import React from 'react';
import PropTypes from 'prop-types';

import './InputTime.styl';

const _getHours = value => value ? value.split(':')[0] : '';
const _getMinutes = value => value ? value.split(':')[1] : '';

const _mergeHours = (value, changedHours) => `${changedHours}:${_getMinutes(value)}`;
const _mergeMinutes = (value, changedMinutes) => `${_getHours(value)}:${changedMinutes}`;

const InputTime = ({
	label,
	value,
	isDisabled,
	isHidden,
	onChangeTime
}) => (
	<fieldset className="InputTime">
		{ !isHidden ?
			<label>
				<span className="label">{label}</span>
				<input
					type="number"
					value={_getHours(value)}
					min={0}
					max={23}
					placeholder="0"
					disabled={isDisabled}
					onChange={event => onChangeTime(_mergeHours(value, event.target.value))}
				/>
				<span className="separator">:</span>
				<input
					type="number"
					value={_getMinutes(value)}
					min={0}
					max={59}
					placeholder="00"
					disabled={isDisabled}
					onChange={event => onChangeTime(_mergeMinutes(value, event.target.value))}
				/>
			</label> : ''
		}
	</fieldset>
);

export default InputTime;

InputTime.propTypes = {
	label: PropTypes.string.isRequired,
	value: PropTypes.string,
	isDisabled: PropTypes.bool,
	isHidden: PropTypes.bool,
	onChangeTime: PropTypes.func
};

InputTime.defaultProps = {
	value: '0:00',
	isDisabled: false,
	isHidden: false,
	onChangeTime: () => {}
};
