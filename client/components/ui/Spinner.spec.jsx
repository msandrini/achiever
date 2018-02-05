import React from 'react';
import { shallow } from 'enzyme';

import Spinner from './Spinner';

describe('Spinner', () => {
	it('should render properly with props.class', () => {
		const wrapper = shallow(<Spinner class="test" />);
		expect(wrapper).toMatchSnapshot();
	});
});
