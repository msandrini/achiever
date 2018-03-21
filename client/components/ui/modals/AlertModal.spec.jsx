import React from 'react';
import { shallow } from 'enzyme';

import AlertModal from './AlertModal';

describe('AlertModal', () => {
	it('should render properly without any props', () => {
		const wrapper = shallow(<AlertModal />);
		expect(wrapper).toMatchSnapshot();
	});
	it('should render with a new title name', () => {
		const wrapper = shallow(<AlertModal title="this is a alert modal title" />);
		expect(wrapper).toMatchSnapshot();
	});
});
