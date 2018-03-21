import React from 'react';
import { shallow } from 'enzyme';

import Modal from './Modal';

describe('Modal', () => {
	it('should render properly without any props', () => {
		const wrapper = shallow(<Modal />);
		expect(wrapper).toMatchSnapshot();
	});
	it('should show modal if props active', () => {
		const wrapper = shallow(<Modal active />);
		expect(wrapper).toMatchSnapshot();
	});
	it('shoudnt render buttons if hasbutton false', () => {
		const wrapper = shallow(<Modal hasButtons={false} />);
		expect(wrapper).toMatchSnapshot();
	});
});
