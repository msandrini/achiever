import React from 'react';
import PropTypes from 'prop-types';
import TimeDuration from 'time-duration';

import './GaugeDescription.styl';

const formatValue = value => (new TimeDuration(value)).toString();

const GaugeDescription = ({ description, value }) => (
	<span className="GaugeDescription">
		{description} <strong>{formatValue(value)}</strong>
	</span>
);

export default GaugeDescription;

GaugeDescription.propTypes = {
	description: PropTypes.string.isRequired,
	value: PropTypes.number.isRequired
};
