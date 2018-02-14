import React from 'react';
import { shallow } from 'enzyme';

import moment from 'moment';

import WeekGraph from './WeekGraph';

Date.now = jest.fn(() => new Date(Date.UTC(2018, 1, 14, 12)).valueOf());

const defaultProps = {
	dailyContractedHours: '8:00',
	controlDate: moment('2018-02-14'),
	weekEntries: {
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
				phase: 'Project Phase Name',
				activity: 'Code/ Document Reviews',
				startTime: '',
				startBreakTime: '',
				endBreakTime: '',
				endTime: '',
				total: '8:00',
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
		],
		total: '56:00'
	},
	storedTimes: [
		{ hours: 7, minutes: 0 },
		{ hours: 12, minutes: 0 },
		{ hours: 0, minutes: 0 },
		{ hours: 0, minutes: 0 }
	]
};

describe('WeekGraph', () => {
	describe('render', () => {
		it('should render nothing using min props', () => {
			const wrapper = shallow(<WeekGraph />);
			expect(wrapper).toMatchSnapshot();
		});
		it('should render GaugeBars if props are correct', () => {
			const wrapper = shallow(<WeekGraph
				weekEntries={defaultProps.weekEntries}
				dailyContractedHours={defaultProps.dailyContractedHours}
				controlDate={defaultProps.controlDate}
				storedTimes={defaultProps.storedTimes}
			/>);
			expect(wrapper).toMatchSnapshot();
		});
	});
});
