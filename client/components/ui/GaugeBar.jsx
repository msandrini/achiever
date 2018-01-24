import React from 'react';
import PropTypes from 'prop-types';

import '../../styles/gaugeBar.styl';

const GaugeBar = (props) => {
	const percentage = (props.currentValue / props.referenceValue) * 100;
	const moreHoursClass = percentage > 100 ? ' more-hours' : '';
	const lessHoursClass = percentage < 100 ? ' less-hours' : '';
	return (
		<div className="gauge-bar">
			<div className="marks" />
			<div
				className={`bar${moreHoursClass}${lessHoursClass}`}
				style={{ width: `${percentage}%` }}
			/>
		</div>
	);
};

GaugeBar.propTypes = {
	currentValue: PropTypes.number.isRequired,
	referenceValue: PropTypes.number.isRequired
};

export default GaugeBar;
