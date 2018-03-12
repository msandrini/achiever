import React from 'react';
import TimeDuration from 'time-duration';
import PropTypes from 'prop-types';

import GaugeBar from '../ui/GaugeBar';

import strings from '../../../shared/strings';
import './LabourStatistics.styl';

const LabourStatistics = (props) => {
	const {
		dayHoursLaboured,
		dayHoursEntitled,
		weekHoursLaboured,
		weekHoursEntitled,
		rawBalance
	} = props;

	const dayHoursLabouredTD = new TimeDuration(dayHoursLaboured);
	const dayHoursEntitledTD = new TimeDuration(dayHoursEntitled);
	const weekHoursBalance = new TimeDuration(weekHoursEntitled - weekHoursLaboured);
	const weekHoursBalanceIndicatorString = (weekHoursBalance > 0) ?
		strings.hoursBalanceOnWeekUpToNowDebt : strings.hoursBalanceOnWeekUpToNowSurplus;
	const weekHoursBalanceNormalised = new TimeDuration(Math.abs(weekHoursBalance));
	const weekHoursBalanceString = weekHoursBalanceIndicatorString
		.replace('{0}', weekHoursBalanceNormalised.toString());
	const rawBalanceDuration = new TimeDuration(rawBalance);
	const controlDateBalance = new TimeDuration(dayHoursLabouredTD - dayHoursEntitledTD);
	const totalBalance = new TimeDuration(rawBalanceDuration - controlDateBalance);

	return (
		<div className="gauges">
			{ dayHoursLaboured &&
				<div className="day-hours">
					<GaugeBar
						currentValue={dayHoursLabouredTD.toMinutes()}
						referenceValue={dayHoursEntitledTD.toMinutes()}
					/>
					<span>
						{strings.hoursLabouredOnThisDay}
						<strong>{dayHoursLaboured}</strong>
					</span>
				</div>
			}
			<div className="week-hours">
				<GaugeBar
					currentValue={weekHoursLaboured.toMinutes()}
					referenceValue={weekHoursEntitled.toMinutes()}
				/>
				<span>
					{strings.hoursBalanceOnWeekUpToNow}
					<strong>{weekHoursBalanceString}</strong>
				</span>
			</div>
			<div className="hour-bank">
				<span>
					{strings.hoursBalanceForToday}
					<strong>{totalBalance.toString()}</strong>
				</span>
			</div>
		</div>
	);
};

LabourStatistics.propTypes = {
	dayHoursLaboured: PropTypes.string,
	dayHoursEntitled: PropTypes.string,
	weekHoursLaboured: PropTypes.object,
	weekHoursEntitled: PropTypes.object,
	rawBalance: PropTypes.string
};

LabourStatistics.defaultProps = {
	dayHoursLaboured: '0:00',
	dayHoursEntitled: '8:00',
	rawBalance: '0:00',
	weekHoursLaboured: new TimeDuration(),
	weekHoursEntitled: new TimeDuration('40:00')
};

export default LabourStatistics;
