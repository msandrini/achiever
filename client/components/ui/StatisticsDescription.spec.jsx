import React from 'react';
import { shallow } from 'enzyme';

import StatisticsDescription from './StatisticsDescription';

describe('StatisticsDescription', () => {
	it('should render with a properly', () => {
		const wrapper = shallow(<StatisticsDescription description='Some description' value='08:00' />);
		expect(wrapper).toMatchSnapshot();
	});
});
