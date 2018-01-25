import React from 'react';
import PropTypes from 'prop-types';

import '../../styles/gaugeBar.styl';

const GaugeBar = ({ currentValue, referenceValue, verticalBar }) => {
	const percentage = (currentValue / referenceValue) * 100;
	const surplusClass = percentage > 100 ? ' surplus' : '';
	const debtClass = percentage < 100 ? ' debt' : '';
	const stylePropToChange = verticalBar ? 'height' : 'width';
	return (
		<div className="gauge-bar">
			<div className="wrapper">
				<div className="marks" />
				<div
					className={`bar${surplusClass}${debtClass}`}
					style={{ [stylePropToChange]: `${percentage}%` }}
				/>
			</div>
		</div>
	);
};

GaugeBar.propTypes = {
	currentValue: PropTypes.number.isRequired,
	referenceValue: PropTypes.number.isRequired,
	verticalBar: PropTypes.bool
};

GaugeBar.defaultProps = {
	verticalBar: false
};

export default GaugeBar;
