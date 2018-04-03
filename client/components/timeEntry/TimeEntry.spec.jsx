import React from 'react';
import { shallow } from 'enzyme';
import moment from 'moment-timezone';


import TimeEntry from './TimeEntry';

const defaultProps = {
	entries: [{}],
	selectedDate: moment.parseZone('2018-04-03T11:22:06.038-03:00'),
	selectedEntry: {},
	statistics: {
		dayBalance: 0,
		weekBalance: 0,
		totalBalance: 0,
		contractedTime: 0,
		weekDay: 0
	},
	successMessage: '',
	errorMessage: '',
	isPersisted: false,
	isLoading: false,
	onDateChange: () => {},
	onChangeEntry: () => {},
	onSubmit: () => {}
};

describe('TimeEntry', () => {
	describe('render', () => {
		it('should render MonthlyCalendar and LabourStatistics', () => {
			const wrapper = shallow(<TimeEntry
				{...defaultProps}
			/>);
			expect(wrapper).toMatchSnapshot();
		});
	});
});

