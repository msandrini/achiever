import React from 'react';
import PropTypes from 'prop-types';

import GaugeBar from './GaugeBar';
import GaugeDescription from './GaugeDescription';

import './Gauge.styl';

const Gauge = ({
	value,
	expected,
	description
}) => (
	<div className="Gauge">
		<GaugeBar
			currentValue={value}
			referenceValue={expected}
		/>
		<GaugeDescription
			description={description}
			value={value}
		/>
	</div>
);

Gauge.propTypes = {
	value: PropTypes.number,
	expected: PropTypes.number,
	description: PropTypes.string
};

Gauge.defaultProps = {
	value: 0,
	expected: 0,
	description: ''
};

export default Gauge;
