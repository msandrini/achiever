import React from 'react';
import { shallow } from 'enzyme';

import PageNotFound from './PageNotFound';

describe('PageNotFound', () => {
	const wrapper = shallow(<PageNotFound />);

	it('should render properly', () => {
		expect(wrapper).toMatchSnapshot();
	});

	it('should go back on click button', () => {
		window.history.back = jest.fn();
		const button = wrapper.find('button');
		button.simulate('click', {});
		expect(window.history.back).toHaveBeenCalled();
	});
});
