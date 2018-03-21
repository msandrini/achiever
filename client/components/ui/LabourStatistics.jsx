import React from 'react';
import PropTypes from 'prop-types';

import Gauge from './Gauge';
import GaugeDescription from './GaugeDescription';

import strings from '../../../shared/strings';
import './LabourStatistics.styl';

const LabourStatistics = ({
	dayBalance,
	weekBalance,
	contractedTime,
	weekDay,
	totalBalance
}) => (
	<div className="LabourStatistics">
		<Gauge
			description={strings.hoursLabouredOnThisDay}
			value={dayBalance}
			expected={contractedTime}
		/>
		<Gauge
			description={strings.hoursBalanceOnWeekUpToNow}
			value={weekBalance}
			expected={contractedTime * weekDay}
		/>
		<GaugeDescription
			description={strings.hoursBalanceForToday}
			value={totalBalance}
		/>
	</div>
);

LabourStatistics.propTypes = {
	totalBalance: PropTypes.number,
	contractedTime: PropTypes.number,
	dayBalance: PropTypes.number,
	weekBalance: PropTypes.number,
	weekDay: PropTypes.number.isRequired
};

LabourStatistics.defaultProps = {
	totalBalance: 0,
	contractedTime: 8,
	dayBalance: 0,
	weekBalance: 0
};

export default LabourStatistics;
