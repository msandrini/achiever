import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { graphql, compose } from 'react-apollo';

import MonthlyCalendar from '../ui/MonthlyCalendar';
import TimeEntryForm from './TimeEntryForm';

import strings from '../../../shared/strings';
import * as queries from '../../queries.graphql';

/*
+---TimeEntry
    +---MonthlyCalendar
    +---LabourStatistics
        +---GaugeBar
        +---StatisticsDescription
    +---TimeEntryForm
        +---MessagePanel
        +---SelectGroup
		+---InputTime
        +---Button
    +---WeeklyCalendar
*/

const TimeEntry = ({
	projectPhasesQuery,
	allEntriesQuery
}) => {
	const {
		timeData
	} = allEntriesQuery.allEntries || { timeData: [{}] };

	return (
		<div className="TimeEntry">
			<h2 className="current-date">{strings.selectedDate}: <strong>{moment().format('L')}</strong></h2>

			<div className="columns">
				<div className="column column-half column-right-aligned">
					<MonthlyCalendar
						selectedDate={moment()}
						timeEntries={timeData}
					/>
				</div>
				<div className="column column-half">
					<TimeEntryForm
						dayEntry={timeData.length ? timeData[0] : null}
						phases={projectPhasesQuery.phases}
						activities={
							projectPhasesQuery.phases ?
								projectPhasesQuery.phases.options[0].activities :
								{}
						}
					/>
				</div>
			</div>
		</div>
	);
};

export default compose(
	graphql(queries.projectPhases, { name: 'projectPhasesQuery' }),
	graphql(queries.allEntries, { name: 'allEntriesQuery' }),
)(TimeEntry);

TimeEntry.propTypes = {
	allEntriesQuery: PropTypes.shape({
		allEntries: PropTypes.shape({
			admission: PropTypes.string,
			name: PropTypes.string,
			timeData: PropTypes.arrayOf(PropTypes.shape({
				balance: PropTypes.string,
				contractedTime: PropTypes.string,
				date: PropTypes.string,
				endBreakTime: PropTypes.string,
				endTime: PropTypes.string,
				startBreakTime: PropTypes.string,
				startTime: PropTypes.string,
				total: PropTypes.string
			}))
		}),
		error: PropTypes.string,
		loading: PropTypes.bool
	}).isRequired,
	projectPhasesQuery: PropTypes.shape({
		phases: PropTypes.shape({
			default: PropTypes.number,
			options: PropTypes.arrayOf(PropTypes.shape({
				id: PropTypes.number,
				name: PropTypes.string,
				activities: PropTypes.shape({
					default: PropTypes.number,
					options: PropTypes.arrayOf(PropTypes.shape({
						id: PropTypes.number,
						name: PropTypes.string
					}))
				})
			}))
		}),
		error: PropTypes.string,
		loading: PropTypes.bool
	}).isRequired
};
