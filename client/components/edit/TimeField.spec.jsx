import React from 'react';
import { shallow, mount } from 'enzyme';

import TimeField from './TimeField';

Math.random = jest.fn(() => '12345');

describe('TimeField', () => {
	describe('render', () => {
		it('should render properly with min props', () => {
			const focusFn = jest.fn();
			const hourTimeField = shallow(<TimeField
				mode="hours"
				onFocus={focusFn}
			/>);
			expect(hourTimeField).toMatchSnapshot();
			expect(focusFn).not.toHaveBeenCalledWith('hours');

			const focusedTimeField = shallow(<TimeField
				shouldHaveFocus
				mode="minutes"
				onFocus={focusFn}
			/>);
			expect(focusedTimeField).toMatchSnapshot();
		});
	});
	describe('onChangeValue', () => {
		it('should call _changeTime and validate it', () => {
			const onChange = jest.fn();
			let wrapper = shallow(<TimeField
				mode="minutes"
				onFocus={jest.fn()}
				onChange={onChange}
			/>);
			const inputField = wrapper.find('input');
			inputField.simulate('change', { target: { value: 35 } });
			expect(onChange).toHaveBeenCalledWith('minutes', 35);

			wrapper = shallow(<TimeField
				mode="hours"
				onFocus={jest.fn()}
				onChange={onChange}
			/>);
			inputField.simulate('change', { target: { value: 'oi' } });
			expect(onChange).toHaveBeenCalledWith('minutes', 0);

			inputField.simulate('change', { target: { value: null } });
			expect(onChange).toHaveBeenCalledWith('minutes', 0);
		});
	});
	describe('onChooseSuggestion', () => {
		it('should change time as user click on Suggestuion Box', () => {
			const onChange = jest.fn();
			const wrapper = shallow(<TimeField
				mode="minutes"
				onFocus={jest.fn()}
				onChange={onChange}
			/>);
			const SuggestionBox = wrapper.find('SuggestionBox');
			SuggestionBox.props().onChoose(15);
			expect(onChange).toHaveBeenCalledWith('minutes', 15);
		});
	});
	describe('onBlur and onFocus', () => {
		it('should be called on blur of input', () => {
			jest.useFakeTimers();
			const wrapper = shallow(<TimeField
				mode="minutes"
				onFocus={jest.fn()}
				onChange={jest.fn()}
			/>);
			wrapper.instance().input = { select: jest.fn() };
			const { onBlur, onFocus } = wrapper.find('input').props();
			onFocus();
			expect(wrapper.instance().input.select).toHaveBeenCalled();
			jest.runAllTimers();
			expect(wrapper.state('isFocused')).toBeTruthy();
			onBlur();
			jest.runAllTimers();
			expect(wrapper.state('isFocused')).toBeFalsy();
		});
	});
	describe('componentDidUpdate', () => {
		it('should have focus if receive props', () => {
			const wrapper = shallow(<TimeField
				mode="minutes"
				onFocus={jest.fn()}
				shouldHaveFocus={false}
			/>);
			wrapper.instance().input = { select: jest.fn(), focus: jest.fn() };
			const focusedProps = wrapper.instance().props;
			wrapper.setProps({ ...focusedProps, shouldHaveFocus: true });
			expect(wrapper.instance().input.focus).toHaveBeenCalledWith();
		});
	});
	describe('componentWillUnmount', () => {
		it('should remove blur timeOut from window', () => {
			window.clearTimeout = jest.fn();
			const onChange = jest.fn();
			const wrapper = mount(<TimeField
				mode="minutes"
				onFocus={jest.fn()}
				onChange={onChange}
				shouldHaveFocus={false}
			/>);

			wrapper.unmount();
			expect(window.clearTimeout).toHaveBeenCalled();
		});
	});
	it('should test default idiot props ¯\\_(ツ)_/¯', () => {
		const wrapper = shallow(<TimeField
			mode="minutes"
			onFocus={jest.fn()}
			shouldHaveFocus={false}
		/>);

		// This is just to check if default change if callable
		const { onChange, handleKeyPress } = wrapper.instance().props;
		onChange();
		handleKeyPress();	// Expect nothing to happen as it's default is () => {}
	});
});
