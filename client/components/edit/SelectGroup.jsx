import React from 'react';
import PropTypes from 'prop-types';

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
	onChange
}) => (
	<div className="select-group">
		<label htmlFor={name}>{label}</label>
		<select
			name={name}
			className="detail-selector"
			value={selected || ''}
			onChange={event => onChange(event.target.value)}
		>
			{ renderOptions(options, selected) }
		</select>
	</div>
);

SelectGroup.propTypes = {
	name: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	options: PropTypes.arrayOf(PropTypes.object),
	selected: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	onChange: PropTypes.func
};

SelectGroup.defaultProps = {
	selected: '',
	options: [],
	onChange: null
};

export default SelectGroup;
