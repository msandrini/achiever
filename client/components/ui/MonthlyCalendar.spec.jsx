import React from 'react';
import { shallow } from 'enzyme';
import moment from 'moment-timezone';

import MonthlyCalendar from './MonthlyCalendar';

const defaultProps = {
	selectedDate: moment('2018-02-14T00:00:00.000Z'),
	onDateChange: jest.fn(),
	timeEntries: [
		{
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
		{
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
		{
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
		{
			date: '2018-02-14',
			phase: '',
			activity: '',
			startTime: '',
			startBreakTime: '',
			endBreakTime: '',
			endTime: '',
			total: '',
			__typename: 'TimeEntry'
		},
		{
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
		{
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
		{
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
	]
};

describe('MonthlyCalendar', () => {
	Date.now = jest.fn(() => new Date(Date.UTC(2018, 1, 14, 12)).valueOf());

	describe('render', () => {
		it('should render DatePicker with style', () => {
			Date.now = jest.fn(() => new Date(Date.UTC(2018, 1, 14, 12)).valueOf());

			const wrapper = shallow(<MonthlyCalendar
				selectedDate={defaultProps.selectedDate}
				onDateChange={defaultProps.onDateChange}
				timeEntries={defaultProps.timeEntries}
			/>);

			expect(wrapper).toMatchSnapshot();
		});

		it('should show if a day in past is blocked', () => {
			Date.now = jest.fn(() => new Date(Date.UTC(2018, 1, 22, 12)).valueOf());

			const nextWeekWrapper = shallow(<MonthlyCalendar
				selectedDate={moment('2018-02-21T00:00:00.000Z')}
				onDateChange={defaultProps.onDateChange}
				timeEntries={defaultProps.timeEntries}
			/>);

			expect(nextWeekWrapper).toMatchSnapshot();
		});

		it('should render without timeEntries', () => {
			const wrapper = shallow(<MonthlyCalendar
				selectedDate={defaultProps.selectedDate}
				onDateChange={defaultProps.onDateChange}
			/>);

			expect(wrapper).toMatchSnapshot();
		});
	});
});
