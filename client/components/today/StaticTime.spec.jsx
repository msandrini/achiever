import React from 'react';
import { shallow } from 'enzyme';

import StaticTime from './StaticTime';

describe('StaticTime', () => {
	describe('render', () => {
		it('should render properly with minimum props', () => {
			const wrapper = shallow(<StaticTime label="entry" emphasis />);
			expect(wrapper).toMatchSnapshot();
		});
	});
	describe('display time', () => {
		it('should display time if anything comes', () => {
			const propTime = { hours: '', minutes: 10 };
			const wrapper = shallow(<StaticTime
				time={propTime}
				label="entry"
				emphasis={false}
			/>);
			expect(wrapper).toMatchSnapshot();
		});
	});
});

