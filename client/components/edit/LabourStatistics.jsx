import React from 'react';
import TimeDuration from 'time-duration';
import PropTypes from 'prop-types';

import '../../styles/labourStatistics.styl';
import GaugeBar from '../ui/GaugeBar';

import strings from '../../../shared/strings';

const LabourStatistics = (props) => {
	const {
		dayHoursLaboured,
		dayHoursEntitled,
		weekHoursLaboured,
		weekHoursEntitled,
		hoursBalance
	} = props;

	const weekHoursBalance = new TimeDuration(weekHoursEntitled - weekHoursLaboured);
	const weekHoursBalanceIndicatorString = (weekHoursBalance > 0) ?
		strings.hoursBalanceOnWeekUpToNowDebt : strings.hoursBalanceOnWeekUpToNowSurplus;
	const weekHoursBalanceString = weekHoursBalanceIndicatorString
		.replace('{0}', weekHoursBalance.toString());

	return (
		<div className="gauges">
			{ dayHoursLaboured &&
				<div className="day-hours">
					<GaugeBar
						currentValue={new TimeDuration(dayHoursLaboured).toMinutes()}
						referenceValue={new TimeDuration(dayHoursEntitled).toMinutes()}
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
					<strong>{hoursBalance}</strong>
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
	hoursBalance: PropTypes.string
};

LabourStatistics.defaultProps = {
	dayHoursLaboured: '0:00',
	dayHoursEntitled: '8:00',
	weekHoursLaboured: new TimeDuration(),
	weekHoursEntitled: new TimeDuration('40:00'),
	hoursBalance: '0:00'
};

export default LabourStatistics;
