import React from 'react';
import { shallow } from 'enzyme';

import GaugeDescription from './GaugeDescription';

describe('GaugeDescription', () => {
	it('should render with a properly', () => {
		const wrapper = shallow(<GaugeDescription description="Some description" value={8 * 60} />);
		expect(wrapper).toMatchSnapshot();
	});
});
