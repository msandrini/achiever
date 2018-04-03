import React from 'react';
import { shallow } from 'enzyme';

import FullScreenSpinner from './FullScreenSpinner';

describe('FullScreenSpinner', () => {
	it('should render properly withouth props', () => {
		const wrapper = shallow(<FullScreenSpinner />);
		expect(wrapper).toMatchSnapshot();
	});

	it('should render properly with active', () => {
		const wrapper = shallow(<FullScreenSpinner active />);
		expect(wrapper).toMatchSnapshot();
	});
});
