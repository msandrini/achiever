import React from 'react';
import { shallow } from 'enzyme';

import Panel from './Panel';

describe('Panel', () => {
	it('should render properly with min props', () => {
		const wrapper = shallow(<Panel type="error" />);
		expect(wrapper).toMatchSnapshot();
	});
	it('should render with a message', () => {
		const wrapper = shallow(<Panel type="success" message="this is a panel message" />);
		expect(wrapper).toMatchSnapshot();
	});
});
