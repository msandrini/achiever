
import React from 'react';
import { shallow } from 'enzyme';

import Login from './Login';

describe('Login', () => {
	it('should match snapshot', () => {
		const wrapper = shallow(<Login signIn={() => {}} />);
		expect(wrapper).toMatchSnapshot();
	});
});
