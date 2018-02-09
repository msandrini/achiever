import React from 'react';
import { shallow } from 'enzyme';

import SuggestionBox from './SuggestionBox';

describe('SuggestionBox', () => {
	describe('render', () => {
		it('should render properly with min props', () => {
			const invisibleWrapper = shallow(<SuggestionBox mode="hours" />);
			const hoursWrapper = shallow(<SuggestionBox show mode="hours" />);
			const minutesWrapper = shallow(<SuggestionBox show mode="minutes" />);
			expect(invisibleWrapper).toMatchSnapshot();
			expect(hoursWrapper).toMatchSnapshot();
			expect(minutesWrapper).toMatchSnapshot();
		});
	});
	describe('onClick', () => {
		it('should call a function with the value selected', () => {
			const onChoose = jest.fn();
			const choosableWrapper = shallow(<SuggestionBox
				show
				mode="minutes"
				onChoose={onChoose}
			/>);

			const fifteenMinutesLi = choosableWrapper.find('li').at(1);
			const minuteSelect = fifteenMinutesLi.find('button');
			minuteSelect.simulate('click', { preventDefault: jest.fn() });

			expect(onChoose).toHaveBeenCalledWith('15');
		});
	});
});
