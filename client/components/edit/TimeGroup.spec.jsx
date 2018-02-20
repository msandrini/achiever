import React from 'react';
import { shallow } from 'enzyme';

import TimeGroup from './TimeGroup';

Math.random = jest.fn(() => '12345');

describe('TimeGroup', () => {
	describe('render', () => {
		it('should render two TimeFields', () => {
			const wrapper = shallow(<TimeGroup onFocus={() => {}} />);
			expect(wrapper).toMatchSnapshot();
		});
		it('should not render if hidden', () => {
			const wrapper = shallow(<TimeGroup onFocus={() => {}} hidden />);
			expect(wrapper).toMatchSnapshot();
		});
	});
	describe('onChangeTime', () => {
		it('should call onSet at time set', () => {
			const onSet = jest.fn();
			const wrapper = shallow(<TimeGroup
				onSet={onSet}
				onFocus={() => {}}
			/>);
			const { onChange } = wrapper.find('TimeField').at(0).props();
			onChange('hours', 12);
			expect(onSet).toHaveBeenCalledWith(12, 0);
		});
	});
	it('should test default idiot props ¯\\_(ツ)_/¯', () => {
		const wrapper = shallow(<TimeGroup
			onFocus={() => {}}
		/>);

		// This is just to check if default change if callable
		const { onSet, handleKeyPress } = wrapper.instance().props;
		onSet();
		handleKeyPress();	// Expect nothing to happen as it's default is () => {}
	});
});
