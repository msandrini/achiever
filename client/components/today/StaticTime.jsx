import React from 'react';
import PropTypes from 'prop-types';

const StaticTime = ({ time }) => (
	<div className="">{time}</div>
);

StaticTime.propTypes = {
	time: PropTypes.objectOf({
		hours: PropTypes.number,
		minutes: PropTypes.number
	})
};

StaticTime.defaultProps = {
	time: { hours: 0, minutes: 0 }
};

export default StaticTime;
