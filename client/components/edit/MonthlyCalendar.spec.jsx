import React from 'react';
import { shallow } from 'enzyme';
import moment from 'moment';

import MonthlyCalendar from './MonthlyCalendar';

const defaultProps = {
	controlDate: moment('2018-02-14T00:00:00.000Z'),
	onDateChange: jest.fn(),
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
				phase: '',
				activity: '',
				startTime: '',
				startBreakTime: '',
				endBreakTime: '',
				endTime: '',
				total: '',
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
	}
};

describe('MonthlyCalendar', () => {
	Date.now = jest.fn(() => new Date(Date.UTC(2018, 1, 14, 12)).valueOf());
	describe('render', () => {
		it('should render DatePicker with style', () => {
			Date.now = jest.fn(() => new Date(Date.UTC(2018, 1, 14, 12)).valueOf());
			const wrapper = shallow(<MonthlyCalendar
				controlDate={defaultProps.controlDate}
				onDateChange={defaultProps.onDateChange}
				weekEntries={defaultProps.weekEntries}
			/>);

			expect(wrapper).toMatchSnapshot();
		});
		it('should show if a day in past is blocked', () => {
			Date.now = jest.fn(() => new Date(Date.UTC(2018, 1, 22, 12)).valueOf());
			const nextWeekWrapper = shallow(<MonthlyCalendar
				controlDate={moment('2018-02-21T00:00:00.000Z')}
				onDateChange={defaultProps.onDateChange}
				weekEntries={defaultProps.weekEntries}
			/>);
			expect(nextWeekWrapper).toMatchSnapshot();
		});
		it('should render without weekEntries', () => {
			const wrapper = shallow(<MonthlyCalendar
				controlDate={defaultProps.controlDate}
				onDateChange={defaultProps.onDateChange}
			/>);
			expect(wrapper).toMatchSnapshot();
		});
	});
});
