import React from 'react';
import PropTypes from 'prop-types';

import '../../styles/staticTime.styl';

const formatTime = value => (
	String(value).length === 1 ? `0${String(value)}` : String(value)
);

const displayTime = value => (
	value ? formatTime(value) : formatTime(0)
);

const StaticTime = ({ time, label, emphasis }) => (
	<div className={`static-time ${emphasis ? 'emphasis' : ''}`}>
		<label>
			{label}
		</label>
		<span className="time">
			{displayTime(time.hours)}:{displayTime(time.minutes)}
		</span>
	</div>
);

StaticTime.propTypes = {
	time: PropTypes.object,
	label: PropTypes.string.isRequired,
	emphasis: PropTypes.bool.isRequired
};

StaticTime.defaultProps = {
	time: { hours: 0, minutes: 0 }
};

export default StaticTime;
