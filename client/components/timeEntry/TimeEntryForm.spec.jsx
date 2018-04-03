import React from 'react';
import { shallow } from 'enzyme';

import TimeEntryForm from './TimeEntryForm';

const defaultProps = {
	entry: {
		date: '2018-02-11',
		startTime: '8:00',
		startBreakTime: '11:30',
		endBreakTime: '12:30',
		endTime: '17:00',
		total: '8:00',
		contractedTime: '8:00',
		weekBalance: '20:00',
		balance: '10:00',
		phase: '',
		activity: ''
	},
	isDisabled: false,
	successMessage: '',
	errorMessage: '',
	onChangeEntry: jest.fn(),
	isPersisted: false,
	onSubmit: () => {}
};

describe('TimeEntryForm', () => {
	describe('render', () => {
		it('should render InputTime', () => {
			const wrapper = shallow(<TimeEntryForm
				{...defaultProps}
			/>);
			expect(wrapper).toMatchSnapshot();
		});
		it('should call onChangeEntry', () => {
			const wrapper = shallow(<TimeEntryForm
				{...defaultProps}
			/>);
			const inputTime = wrapper.find('InputTimeGroup').first();
			const onChangeTime = inputTime.prop('onChangeTime');
			const startTime = 8;
			onChangeTime(startTime);
			expect(defaultProps.onChangeEntry).toHaveBeenCalledWith({ ...defaultProps.entry, startTime });
		});
	});
});
