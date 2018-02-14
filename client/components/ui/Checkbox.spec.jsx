import React from 'react';
import { shallow } from 'enzyme';

import CheckBox from './CheckBox';

const KEY_SPACEBAR = 32;

describe('CheckBox', () => {
	describe('render', () => {
		it('should render properly when minimum props are passed', () => {
			const wrapper = shallow(<CheckBox label="hello check" />);
			expect(wrapper).toMatchSnapshot();

			const wrapperDisabled = shallow(<CheckBox label="hello check" disabled />);
			expect(wrapperDisabled).toMatchSnapshot();

			const wrapperChecked = shallow(<CheckBox label="hello check" value />);
			expect(wrapperChecked).toMatchSnapshot();
		});
	});
	describe('handleCheck', () => {
		it('should mark as checked when spacebar is pressed', () => {
			const wrapper = shallow(<CheckBox label="hello check" />);
			wrapper.simulate('keyDown', {
				preventDefault: jest.fn(),
				type: 'keyDown',
				keyCode: KEY_SPACEBAR
			});
			expect(wrapper.state('checked')).toEqual(true);
		});
		it('should not mark if props is disabled', () => {
			const preventDefault = jest.fn();
			const wrapper = shallow(<CheckBox label="hello check" disabled />);
			wrapper.simulate('keyDown', {
				preventDefault,
				type: 'keyDown',
				keyCode: KEY_SPACEBAR
			});
			expect(preventDefault).not.toHaveBeenCalled();
		});
		it('should not mark if key press is not space', () => {
			const preventDefault = jest.fn();
			const wrapper = shallow(<CheckBox label="hello check" />);
			wrapper.simulate('keyDown', {
				preventDefault,
				type: 'keyDown',
				keyCode: 0
			});
			expect(preventDefault).not.toHaveBeenCalled();
		});
	});
	describe('componentWillReceiveProps', () => {
		it('should change its state if props value change', () => {
			const wrapper = shallow(<CheckBox label="hello check" />);
			expect(wrapper.state('checked')).toBeFalsy();
			wrapper.setProps({ value: true });
			expect(wrapper.state('checked')).toBeTruthy();
		});
	});
});
