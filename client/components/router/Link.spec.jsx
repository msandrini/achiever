import React from 'react';
import { shallow } from 'enzyme';

import Link from './Link';

import * as history from './history';

describe('Link', () => {
	it('should render a link navigation based on props', () => {
		const wrapper = shallow(<Link to="/home" />);
		expect(wrapper).toMatchSnapshot();
	});
	it('should have active class is active', () => {
		const wrapper = shallow(<Link to="/home" isActive />);
		expect(wrapper).toMatchSnapshot();
	});
	describe('onClick', () => {
		it('should use local history if local path', () => {
			history.push = jest.fn();

			const wrapper = shallow(<Link to="/home" />);
			let link = wrapper.find('a');

			link.simulate('click', { preventDefault: jest.fn() });
			expect(history.push).toHaveBeenCalledTimes(1);

			const wrapper2 = shallow(<Link to="http://www.pudim.com.br" />);
			link = wrapper2.find('a');

			link.simulate('click', { preventDefault: jest.fn() });
			expect(history.push).toHaveBeenCalledTimes(1);
		});
	});
});
