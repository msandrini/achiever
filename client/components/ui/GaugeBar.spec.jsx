import React from 'react';
import { shallow } from 'enzyme';

import GaugeBar from './GaugeBar';

describe('GaugeBar', () => {
	it('shoul render a surplus gauge if current > ref', () => {
		const wrapper = shallow(<GaugeBar
			currentValue={100}
			referenceValue={10}
		/>);
		expect(wrapper).toMatchSnapshot();
	});
	it('shoul render a debt gauge if current > ref and vertical', () => {
		const wrapper = shallow(<GaugeBar
			currentValue={10}
			referenceValue={100}
			verticalBar
		/>);
		expect(wrapper).toMatchSnapshot();
	});
});
