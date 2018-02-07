import React from 'react';
import { shallow } from 'enzyme';

import Menu from './Menu';

import * as token from '../authentication/token';

describe('Menu', () => {
	it('should render a menu based on path and authenticated', () => {
		token.getAuthToken = jest.fn(() => ('logged-in!!!'));
		window.location.pathname = jest.fn(() => ('/'));
		const wrapper = shallow(<Menu />);
		expect(wrapper).toMatchSnapshot();
	});
	it('should render a menu based on path and not authenticated', () => {
		token.getAuthToken = jest.fn(() => (null));
		window.location.pathname = jest.fn(() => ('/'));
		const wrapper = shallow(<Menu />);
		expect(wrapper).toMatchSnapshot();
	});
});
