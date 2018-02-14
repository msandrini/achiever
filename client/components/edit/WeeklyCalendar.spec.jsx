import React from 'react';
import { shallow } from 'enzyme';
import moment from 'moment';

import WeeklyCalendar from './WeeklyCalendar';

const defaultProps = {
	controlDate: moment('2018-02-14'),
	weekEntries: {
		timeEntries: {
			0: {
				date: '2018-02-11',
				phase: 'Project Phase Name',
				activity: 'Code/ Document Reviews',
				startTime: '9:28',
				startBreakTime: '11:35',
				endBreakTime: '12:35',
				endTime: '18:28',
				total: '8:00',
				__typename: 'TimeEntry'
			},
			1: {
				date: '2018-02-12',
				phase: 'Project Phase Name',
				activity: 'Code/ Document Reviews',
				startTime: '9:28',
				startBreakTime: '11:35',
				endBreakTime: '12:35',
				endTime: '18:28',
				total: '8:00',
				__typename: 'TimeEntry'
			},
			2: {
				date: '2018-02-13',
				phase: 'Project Phase Name',
				activity: 'Code/ Document Reviews',
				startTime: '9:28',
				startBreakTime: '11:35',
				endBreakTime: '12:35',
				endTime: '18:28',
				total: '8:00',
				__typename: 'TimeEntry'
			},
			3: {
				date: '2018-02-14',
				phase: 'Project Phase Name',
				activity: 'Code/ Document Reviews',
				startTime: '9:28',
				startBreakTime: '',
				endBreakTime: '',
				endTime: '18:28',
				total: '8:00',
				__typename: 'TimeEntry'
			},
			4: {
				date: '2018-02-15',
				phase: 'Project Phase Name',
				activity: 'Code/ Document Reviews',
				startTime: '9:28',
				startBreakTime: '11:35',
				endBreakTime: '12:35',
				endTime: '18:28',
				total: '8:00',
				__typename: 'TimeEntry'
			},
			5: {
				date: '2018-02-16',
				phase: 'Project Phase Name',
				activity: 'Code/ Document Reviews',
				startTime: '9:28',
				startBreakTime: '',
				endBreakTime: '',
				endTime: '18:28',
				total: '8:00',
				__typename: 'TimeEntry'
			},
			6: {
				date: '2018-02-17',
				phase: 'Project Phase Name',
				activity: 'Code/ Document Reviews',
				startTime: '9:28',
				startBreakTime: '11:35',
				endBreakTime: '12:35',
				endTime: '18:28',
				total: '8:00',
				__typename: 'TimeEntry'
			}
		},
		total: '56:00'
	},
	storedTimes: [
		{ hours: 7, minutes: 0 },
		{ hours: 12, minutes: 0 },
		{},
		{}
	]
};

describe('WeeklyCalendar', () => {
	describe('render', () => {
		it('should render the BigCalendar dealing with the props', () => {
			const wrapper = shallow(<WeeklyCalendar
				controlDate={defaultProps.controlDate}
				weekEntries={defaultProps.weekEntries}
				storedTimes={defaultProps.storedTimes}
			/>);
			const emptyWrapper = shallow(<WeeklyCalendar
				controlDate={defaultProps.controlDate}
				weekEntries={{ timeEntries: null }}
				storedTimes={defaultProps.storedTimes}
			/>);
			expect(wrapper).toMatchSnapshot();
			expect(emptyWrapper).toMatchSnapshot();
		});
	});
});
