import React from 'react';
import PropTypes from 'prop-types';

import '../../styles/selectGroup.styl';

const renderOptions = options =>
	options.map(option => (
		<option key={option.id} value={option.id}>
			{option.name}
		</option>
	));

const SelectGroup = ({
	name,
	label,
	options,
	selected,
	onChange,
	showTextInstead
}) => (
	<div className="select-group">
		<label htmlFor={name}>{label}</label>
		{ showTextInstead ?
			<div className="select-group-replacement">
				{showTextInstead}
			</div> :
			<select
				name={name}
				className="detail-selector"
				value={selected || ''}
				onChange={event => onChange(event.target.value)}
			>
				{ renderOptions(options, selected) }
			</select>
		}
	</div>
);

SelectGroup.propTypes = {
	name: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	options: PropTypes.arrayOf(PropTypes.object),
	selected: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	onChange: PropTypes.func,
	showTextInstead: PropTypes.string
};

SelectGroup.defaultProps = {
	selected: '',
	options: [],
	onChange: null,
	showTextInstead: null
};

export default SelectGroup;
