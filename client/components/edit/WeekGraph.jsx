import React from 'react';
import PropTypes from 'prop-types';
import TimeDuration from 'time-duration';

import GaugeBar from '../ui/GaugeBar';

import '../../styles/weekGraph.styl';

const renderDayBar = dailyContractedHours => (dayInfo) => {
	const current = new TimeDuration(dayInfo.total).toMinutes();
	const reference = new TimeDuration(dailyContractedHours).toMinutes();
	return (
		<GaugeBar
			key={dayInfo.date}
			currentValue={current}
			referenceValue={reference}
			verticalBar
		/>
	);
};

const WeekGraph = ({ dailyContractedHours, weekEntries }) => {
	if (weekEntries.timeEntries && weekEntries.timeEntries.length &&
		weekEntries.timeEntries.length === 7) {
		const entriesForWeekDays = weekEntries.timeEntries
			.filter((dayEntry, index) => index !== 0 && index !== 6);
		return (
			<div className="week-graph">
				{entriesForWeekDays.map(renderDayBar(dailyContractedHours))}
			</div>
		);
	}
	return null;
};

WeekGraph.propTypes = {
	weekEntries: PropTypes.object.isRequired,
	dailyContractedHours: PropTypes.string
};

WeekGraph.defaultProps = {
	weekEntries: {},
	dailyContractedHours: '8:00'
};

export default WeekGraph;
