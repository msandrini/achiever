import React from 'react';
import { shallow } from 'enzyme';

import SelectGroup from './SelectGroup';

const mockOptions = ['one', 'two', 'three'];

describe('SelectGroup', () => {
	describe('render', () => {
		it('should show a select component with min props', () => {
			const wrapper = shallow(<SelectGroup name="testName" label="testLabel" />);
			expect(wrapper).toMatchSnapshot();
		});
		it('should call onChange with selected option', () => {
			const onChangeFn = jest.fn();
			const wrapper = shallow(<SelectGroup
				name="testName"
				label="testLabel"
				options={mockOptions}
				onChange={onChangeFn}
			/>);
			const selectField = wrapper.find('select');
			selectField.simulate('change', { target: { value: 2 } });
			expect(onChangeFn).toHaveBeenCalledWith(2);
		});
	});
});
