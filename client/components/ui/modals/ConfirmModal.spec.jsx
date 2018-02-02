import React from 'react';
import { shallow } from 'enzyme';

import ConfirmModal from './ConfirmModal';

const propsContent = 'this is a test confirm modal';
const propsOnConfirm = jest.fn();

describe('ConfirmModal', () => {
	it('should render properly with the necessary props', () => {
		const wrapper = shallow(<ConfirmModal
			content={propsContent}
			onConfirm={propsOnConfirm}
		/>);
		expect(wrapper).toMatchSnapshot();
	});
	it('should render with a new title name', () => {
		const wrapper = shallow(<ConfirmModal
			title="this is a confirm modal title"
			content={propsContent}
			onConfirm={propsOnConfirm}
		/>);
		expect(wrapper).toMatchSnapshot();
	});
});
