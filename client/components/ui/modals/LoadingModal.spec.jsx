import React from 'react';
import { shallow } from 'enzyme';

import LoadingModal from './LoadingModal';

describe('LoadingModal', () => {
	it('should render properly without props', () => {
		const wrapper = shallow(<LoadingModal />);
		expect(wrapper).toMatchSnapshot();
	});
	it('should render with a new title name', () => {
		const wrapper = shallow(<LoadingModal title="this is a loading modal title" />);
		expect(wrapper).toMatchSnapshot();
	});
});
