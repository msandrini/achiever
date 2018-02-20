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

			onCheck(false);
			expect(wrapper.state('pauseIsEnabled')).toBeFalsy();
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

			// If no param, should be called with 0
			onSet();
			expect(onTimeChangeIntern).toHaveBeenCalledWith(0, 0);
			expect(onTimeChange).toBeCalledWith(2);
		});
	});
	describe('checksForAutotabNeed', () => {
		describe('_getNextField', () => {
			const defaultCompleteEvent = { target: { value: 12 }, key: 2 };
			const onTimeChangeIntern = jest.fn();
			const onTimeChange = jest.fn(() => onTimeChangeIntern);
			const focusOnSubmit = jest.fn();

			const wrapper = shallow(<ActiveDayTimes
				onTimeChange={onTimeChange}
				focusOnSubmit={focusOnSubmit}
			/>);

			it('should go to next timeGroup if focused on minutes but last', () => {
				const { handleKeyPress } = wrapper.find('TimeGroup').at(2).props();
				// If value is minutes,
				wrapper.setState({ focusedField: { index: 2, fieldMode: 'minutes' } });
				handleKeyPress(defaultCompleteEvent);
				expect(wrapper.state('shouldHaveFocus')).toEqual({ index: 3, fieldMode: 'hours' });
			});
			it('should go to next timeField minutes if focused on hours', () => {
				const { handleKeyPress } = wrapper.find('TimeGroup').at(3).props();
				// If value is hours,
				wrapper.setState({ focusedField: { index: 3, fieldMode: 'hours' } });
				handleKeyPress(defaultCompleteEvent);
				expect(wrapper.state('shouldHaveFocus')).toEqual({ index: 3, fieldMode: 'minutes' });
			});
			it('should focus on submit if is the last minute', () => {
				const { handleKeyPress } = wrapper.find('TimeGroup').at(3).props();
				// If its last field
				wrapper.setState({ focusedField: { index: 3, fieldMode: 'minutes' } });
				handleKeyPress(defaultCompleteEvent);
				expect(focusOnSubmit).toHaveBeenCalled();
			});
		});
		it('should not focus on next field calling onChange', () => {
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
			expect(wrapper.state('shouldHaveFocus')).toBeNull();
		});
		it('should not focus if key pressed is not a number', () => {
			const defaultCompleteEvent = { target: { value: 12 }, key: 'a' };
			const onTimeChangeIntern = jest.fn();
			const onTimeChange = jest.fn(() => onTimeChangeIntern);
			const focusOnSubmit = jest.fn();

			const wrapper = shallow(<ActiveDayTimes
				onTimeChange={onTimeChange}
				focusOnSubmit={focusOnSubmit}
			/>);
			// If value doesn't have legnth 2
			wrapper.setState({ focusedField: { index: 1, fieldMode: 'minutes' } });
			const { handleKeyPress } = wrapper.find('TimeGroup').at(1).props();
			handleKeyPress(defaultCompleteEvent);
			expect(wrapper.state('shouldHaveFocus')).toBeFalsy();
		});
		it('should not focus if key input field length is less the 2', () => {
			const defaultCompleteEvent = { target: { value: 2 }, key: '1' };
			const onTimeChangeIntern = jest.fn();
			const onTimeChange = jest.fn(() => onTimeChangeIntern);
			const focusOnSubmit = jest.fn();

			const wrapper = shallow(<ActiveDayTimes
				onTimeChange={onTimeChange}
				focusOnSubmit={focusOnSubmit}
			/>);
			// If value doesn't have legnth 2
			wrapper.setState({ focusedField: { index: 1, fieldMode: 'minutes' } });
			const { handleKeyPress } = wrapper.find('TimeGroup').at(1).props();
			handleKeyPress(defaultCompleteEvent);
			expect(wrapper.state('shouldHaveFocus')).toBeFalsy();
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
					{ },
					{ hours: 10, minutes: '' },
					{},
					{ hours: 17, minutes: 0 }
				]
			});
			expect(wrapper.state('pauseIsEnabled')).toBeFalsy();
		});
		it('should not set pauseIsEnabled if none storedTimes ahs changed', () => {
			const onTimeChange = jest.fn();
			const focusOnSubmit = jest.fn();

			const wrapper = shallow(<ActiveDayTimes
				onTimeChange={onTimeChange}
				focusOnSubmit={focusOnSubmit}
			/>);
			expect(wrapper.state('pauseIsEnabled')).toBeFalsy();
			wrapper.setProps({
				storedTimes: [
					{ },
					{ },
					{ },
					{ }
				]
			});
			expect(wrapper.state('pauseIsEnabled')).toBeFalsy();
		});
	});
});
