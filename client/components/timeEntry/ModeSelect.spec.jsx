import React from 'react';
import { shallow } from 'enzyme';

import ModeSelect from './ModeSelect';

const defaultProps = {
	mode: '',
	onSelect: jest.fn()
};

describe('ModeSelect', () => {
	describe('render', () => {
		it('should call onSelect with value', () => {
			const wrapper = shallow(<ModeSelect
				{...defaultProps}
			/>);
			const selectMode = wrapper.find('select');
			const onChange = selectMode.prop('onChange');
			onChange({ target: { value: 2 } });
			expect(defaultProps.onSelect).toHaveBeenCalledWith(2);
		});
	});
});
