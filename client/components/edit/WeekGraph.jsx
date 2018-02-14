import React from 'react';
import PropTypes from 'prop-types';
import TimeDuration from 'time-duration';

import GaugeBar from '../ui/GaugeBar';

import { timesAreValid, calculateLabouredHours } from '../../utils';

import '../../styles/weekGraph.styl';

const renderDayBar = (dailyContractedHours, controlDate, storedTimes) => (dayInfo) => {
	const current = (dayInfo.date === controlDate.format('YYYY-MM-DD')) ?
		(timesAreValid(storedTimes) &&
			new TimeDuration(calculateLabouredHours(storedTimes)).toMinutes()
		) || 0 :
		new TimeDuration(dayInfo.total).toMinutes();
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

const WeekGraph = (props) => {
	const {
		dailyContractedHours,
		weekEntries,
		controlDate,
		storedTimes
	} = props;

	if (weekEntries.timeEntries && weekEntries.timeEntries.length &&
		weekEntries.timeEntries.length === 7) {
		const entriesForWeekDays = weekEntries.timeEntries
			.filter((dayEntry, index) => index !== 0 && index !== 6);
		return (
			<div className="week-graph">
				{entriesForWeekDays.map(renderDayBar(dailyContractedHours, controlDate, storedTimes))}
			</div>
		);
	}
	return null;
};

WeekGraph.propTypes = {
	weekEntries: PropTypes.object,
	dailyContractedHours: PropTypes.string,
	controlDate: PropTypes.object,
	storedTimes: PropTypes.array
};

WeekGraph.defaultProps = {
	weekEntries: { timeEntries: null },
	dailyContractedHours: '8:00',
	controlDate: {},
	storedTimes: [{}, {}, {}, {}]
};

export default WeekGraph;
