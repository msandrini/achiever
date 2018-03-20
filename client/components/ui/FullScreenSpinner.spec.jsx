import React from 'react';
import { shallow } from 'enzyme';

import PageLoading from './PageLoading';

describe('PageLoading', () => {
	it('should render properly withouth props', () => {
		const wrapper = shallow(<PageLoading />);
		expect(wrapper).toMatchSnapshot();
	});

	it('should render properly with active', () => {
		const wrapper = shallow(<PageLoading active />);
		expect(wrapper).toMatchSnapshot();
	});
});
