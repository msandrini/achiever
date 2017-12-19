import React from 'react';
import PropTypes from 'prop-types';

const formatTime = value => (
	String(value).length === 1 ? `0${String(value)}` : String(value)
);

const StaticTime = ({ time }) => (
	<div className="static-time">
		<h2>{formatTime(time.hours)}:{formatTime(time.minutes)}</h2>
	</div>
);

StaticTime.propTypes = {
	time: PropTypes.shape({
		hours: PropTypes.number,
		minutes: PropTypes.number
	})
};

StaticTime.defaultProps = {
	time: { hours: 0, minutes: 0 }
};

export default StaticTime;
