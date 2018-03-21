import React from 'react';
import PropTypes from 'prop-types';

import './SelectGroup.styl';

const renderOptions = options => options.map(option => (
	<option key={option} value={option}>
		{option}
	</option>
));

const SelectGroup = ({
	label,
	options,
	selected,
	onChange,
	showTextInstead,
	isDisabled
}) => (
	<fieldset className="SelectGroup">
		<label>
			<span className="label">{ label }</span>
			{ showTextInstead ?
				<div>
					{ showTextInstead }
				</div> :
				<select
					value={selected || ''}
					onChange={event => onChange(event.target.value)}
					disabled={isDisabled}
				>
					{ renderOptions(options) }
				</select>
			}
		</label>
	</fieldset>
);

SelectGroup.propTypes = {
	label: PropTypes.string.isRequired,
	options: PropTypes.arrayOf(PropTypes.string),
	selected: PropTypes.string,
	onChange: PropTypes.func,
	showTextInstead: PropTypes.string,
	isDisabled: PropTypes.bool
};

SelectGroup.defaultProps = {
	selected: '',
	options: [],
	onChange: null,
	showTextInstead: null,
	isDisabled: false
};

export default SelectGroup;
