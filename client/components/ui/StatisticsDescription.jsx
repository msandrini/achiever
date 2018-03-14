import React from 'react';
import PropTypes from 'prop-types';

import './StatisticsDescription.styl';

const StatisticsDescription = ({ description, value }) => (
	<span className="StatisticsDescription">
		{description} <strong>{value}</strong>
	</span>
);

export default StatisticsDescription;

StatisticsDescription.propTypes = {
	description: PropTypes.string.isRequired,
	value: PropTypes.string.isRequired
}
