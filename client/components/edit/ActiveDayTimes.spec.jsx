import React from 'react';
import { shallow } from 'enzyme';

import ActiveDayTimes from './ActiveDayTimes';

describe('ActiveDayTimes', () => {
	describe('render', () => {
		it('should render 4 TimeGroups', () => {
			const wrapper = shallow(<ActiveDayTimes onTimeChange={() => {}} />);
			expect(wrapper).toMatchSnapshot();

			const wrapperFocus = shallow(<ActiveDayTimes onTimeChange={() => {}} />);
			wrapperFocus.setState({ shouldHaveFocus: { fieldMode: 'hours', index: 1 } });
			expect(wrapper).toMatchSnapshot();

			const { onFocus } = wrapperFocus.find('TimeGroup').at(1).props();
			onFocus('hours');
			expect(wrapperFocus.state('focusedField')).toEqual({ index: 1, fieldMode: 'hours' });
		});
	});
	describe('togglePause', () => {
		it('should hide lunch fields on check', () => {
			const wrapper = shallow(<ActiveDayTimes onTimeChange={() => () => {}} />);
			const { onCheck } = wrapper.find('CheckBox').props();
			onCheck(true);
			expect(wrapper).toMatchSnapshot();
		});
	});
	describe('onChangeTime', () => {
		it('should call onTimeChange with the with correct params', () => {
			const onTimeChangeIntern = jest.fn();
			const onTimeChange = jest.fn(() => onTimeChangeIntern);
			const wrapper = shallow(<ActiveDayTimes onTimeChange={onTimeChange} />);
			const { onSet } = wrapper.find('TimeGroup').at(2).props();
			onSet(10, 10);
			expect(onTimeChangeIntern).toHaveBeenCalledWith(10, 10);
			expect(onTimeChange).toBeCalledWith(2);
		});

		describe('AutoTab', () => {
			it('should get the nextField', () => {
				const onTimeChangeIntern = jest.fn();
				const onTimeChange = jest.fn(() => onTimeChangeIntern);
				const focusOnSubmit = jest.fn();

				const wrapper = shallow(<ActiveDayTimes
					onTimeChange={onTimeChange}
					focusOnSubmit={focusOnSubmit}
				/>);

				// If value doesn't have legnth 2
				wrapper.setState({ focusedField: { index: 1, fieldMode: 'minutes' } });
				const { onSet: onSet1 } = wrapper.find('TimeGroup').at(1).props();
				onSet1();
				expect(wrapper.state('shouldHaveFocus')).toEqual(false);

				const { onSet: onSet2 } = wrapper.find('TimeGroup').at(2).props();
				// If value is minutes,
				wrapper.setState({ focusedField: { index: 2, fieldMode: 'minutes' } });
				onSet2('10', '45');
				expect(wrapper.state('shouldHaveFocus')).toEqual({ index: 3, fieldMode: 'hours' });

				const { onSet: onSet3 } = wrapper.find('TimeGroup').at(3).props();
				// If value is hours,
				wrapper.setState({ focusedField: { index: 3, fieldMode: 'hours' } });
				onSet3('11', '00');
				expect(wrapper.state('shouldHaveFocus')).toEqual({ index: 3, fieldMode: 'minutes' });
				// If its last field
				wrapper.setState({ focusedField: { index: 3, fieldMode: 'minutes' } });
				onSet3('11', '10');
				expect(focusOnSubmit).toHaveBeenCalled();
			});
		});
	});
	describe('componentWillReceiveProps', () => {
		it('should mark pause enable if all but break field has content', () => {
			const onTimeChange = jest.fn();
			const focusOnSubmit = jest.fn();

			const wrapper = shallow(<ActiveDayTimes
				onTimeChange={onTimeChange}
				focusOnSubmit={focusOnSubmit}
			/>);
			expect(wrapper.state('pauseIsEnabled')).toBeFalsy();
			wrapper.setProps({
				storedTimes: [
					{ hours: 10, minutes: 0 },
					{},
					{},
					{ hours: 17, minutes: 0 }
				]
			});
			expect(wrapper.state('pauseIsEnabled')).toBeTruthy();
		});
		it('should mark pause disable if any break field has content', () => {
			const onTimeChange = jest.fn();
			const focusOnSubmit = jest.fn();

			const wrapper = shallow(<ActiveDayTimes
				onTimeChange={onTimeChange}
				focusOnSubmit={focusOnSubmit}
			/>);
			expect(wrapper.state('pauseIsEnabled')).toBeFalsy();
			wrapper.setProps({
				storedTimes: [
					{ hours: 10, minutes: 0 },
					{ hours: 10, minutes: '' },
					{},
					{ hours: 17, minutes: 0 }
				]
			});
			expect(wrapper.state('pauseIsEnabled')).toBeFalsy();
		});
	});
});
