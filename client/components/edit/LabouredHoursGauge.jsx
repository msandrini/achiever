import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';

import '../../styles/labouredHoursGauge.styl';

const LabouredHoursGauge = (props) => {
	const entitledDuration = moment.duration(props.entitledHours);
	const labouredDuration = moment.duration(props.labouredHours);
	const percentage = (labouredDuration.asMinutes() / entitledDuration.asMinutes()) * 100;
	const moreHoursClass = percentage > 100 ? ' more-hours' : '';
	const lessHoursClass = percentage < 100 ? ' less-hours' : '';
	return (
		<div className="laboured-hours">
			<div className="gauge-marks" />
			<div className="gauge">
				<div
					className={`bar${moreHoursClass}${lessHoursClass}`}
					style={{ width: `${percentage}%` }}
				/>
			</div>
			<span>{props.children}</span>
		</div>
	);
};

LabouredHoursGauge.propTypes = {
	entitledHours: PropTypes.string,
	labouredHours: PropTypes.string,
	children: PropTypes.node
};

LabouredHoursGauge.defaultProps = {
	entitledHours: '0:00',
	labouredHours: '0:00',
	children: null
};

export default LabouredHoursGauge;
