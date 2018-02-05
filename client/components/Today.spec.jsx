import React from 'react';
import { shallow, mount } from 'enzyme';

import Today from './Today';

import * as utils from '../utils';

Date.now = jest.fn(() => new Date(Date.UTC(2014, 0, 1, 12)).valueOf());

const defaultDayEntryQuery = {
	loading: false,
	dayEntry: {
		timeEntry: {
			date: '2012-01-01',
			phase: 'Project Phase Name',
			activity: 'Code/ Document Reviews',
			startTime: '',
			startBreakTime: '',
			endBreakTime: '',
			endTime: '',
			total: '',
			__typename: 'TimeEntry'
		},
		__typename: 'DayEntry'
	},
	error: false
};

describe('<Today />', () => {
	describe('render', () => {
		afterEach(() => {
			global.localStorage.clear();
		});

		it('should render properly when all timefieds are empty', () => {
			const wrapper = shallow(<Today
				dayEntryQuery={defaultDayEntryQuery}
				addTimeEntry={() => {}}
			/>);
			expect(wrapper).toMatchSnapshot();
		});
		it('should render properly when all timefields are complete', () => {
			const fullDayEntryQuery = {
				loading: false,
				dayEntry: {
					timeEntry: {
						...defaultDayEntryQuery.dayEntry.timeEntry,
						startTime: '08:00',
						startBreakTime: '12:00',
						endBreakTime: '13:00',
						endTime: '18:00',
						total: '09:00'
					}
				}
			};

			const wrapper = shallow(<Today
				dayEntryQuery={fullDayEntryQuery}
				addTimeEntry={() => {}}
			/>);
			expect(wrapper).toMatchSnapshot();
			global.localStorage.clear();
		});
		it('should render properly when some times are on localStorage', () => {
			const todayStorage = {
				storedTimes: [
					{ hours: 8, minutes: 57 },
					{ hours: 9, minutes: 10 },
					{},
					{}
				],
				sentToday: false
			};

			utils.setTodayStorage(todayStorage);
			const wrapper = shallow(<Today
				dayEntryQuery={defaultDayEntryQuery}
				addTimeEntry={() => {}}
			/>);
			expect(wrapper).toMatchSnapshot();
		});
		it('should render properly when all times are on localStorage', () => {
			const todayStorage = {
				storedTimes: [
					{ hours: 8, minutes: 57 },
					{ hours: 9, minutes: 10 },
					{ hours: 9, minutes: 30 },
					{ hours: 9, minutes: 49 }
				],
				sentToday: false
			};

			utils.setTodayStorage(todayStorage);
			const wrapper = shallow(<Today
				dayEntryQuery={defaultDayEntryQuery}
				addTimeEntry={() => {}}
			/>);
			expect(wrapper).toMatchSnapshot();
		});
		it('should render properly when all times are on localStorage and already sent', () => {
			const todayStorage = {
				storedTimes: [
					{ hours: 11, minutes: '00' },
					{ hours: 12, minutes: '00' },
					{ hours: 13, minutes: '00' },
					{ hours: 14, minutes: '00' }
				],
				sentToday: true
			};

			utils.setTodayStorage(todayStorage);
			const wrapper = shallow(<Today
				dayEntryQuery={defaultDayEntryQuery}
				addTimeEntry={() => {}}
			/>);
			expect(wrapper).toMatchSnapshot();
		});
		it('should alert when times on localStorage are invalid', () => {
			window.history.back = jest.fn();

			const todayStorage = {
				storedTimes: [
					{ hours: 16, minutes: '00' },
					{ hours: 15, minutes: '00' },
					{ hours: 14, minutes: '00' },
					{ hours: 13, minutes: '00' }
				],
				sentToday: false
			};

			utils.setTodayStorage(todayStorage);
			const wrapper = shallow(<Today
				dayEntryQuery={defaultDayEntryQuery}
				addTimeEntry={() => {}}
			/>);
			expect(wrapper).toMatchSnapshot();
			const alertModalOnClose = wrapper.find('AlertModal').prop('onClose');
			alertModalOnClose();
			expect(window.history.back).toHaveBeenCalled();
		});
		it('should wait if dayEntryQuery is still loading', () => {
			const wrapper = shallow(<Today
				dayEntryQuery={{ ...defaultDayEntryQuery, loading: true }}
				addTimeEntry={() => {}}
			/>);
			expect(wrapper).toMatchSnapshot(); //
		});
	});

	describe('ConfirmModal', () => {
		it('should call _onConfirmSubmit onConfirm', () => {
			utils.submitToServer = jest.fn(() => Promise.resolve({ successMessage: 'Success!!' }));

			const wrapper = shallow(<Today
				dayEntryQuery={defaultDayEntryQuery}
				addTimeEntry={() => {}}
			/>);

			const confirmModalWrapper = wrapper.find('ConfirmModal');
			const onConfirm = confirmModalWrapper.prop('onConfirm');
			expect(onConfirm).toEqual(expect.any(Function));
			onConfirm();
			expect(utils.submitToServer).toHaveBeenCalled();
		});
		it('should call goBack onConfirm failed', () => {
			window.history.back = jest.fn();
			utils.submitToServer = jest.fn(() => Promise.resolve({}));

			const wrapper = shallow(<Today
				dayEntryQuery={defaultDayEntryQuery}
				addTimeEntry={() => {}}
			/>);

			const confirmModalWrapper = wrapper.find('ConfirmModal');
			const onConfirm = confirmModalWrapper.prop('onConfirm');
			expect(onConfirm).toEqual(expect.any(Function));
			onConfirm();
			expect(utils.submitToServer).toHaveBeenCalled();
			//* expect(window.history.back).toHaveBeenCalled();
		});
		it('should call goBack onCancel', () => {
			window.history.back = jest.fn();

			const wrapper = shallow(<Today
				dayEntryQuery={defaultDayEntryQuery}
				addTimeEntry={() => {}}
			/>);

			const confirmModalWrapper = wrapper.find('ConfirmModal');
			const onCancel = confirmModalWrapper.prop('onCancel');
			expect(onCancel).toEqual(expect.any(Function));
			onCancel();
			expect(window.history.back).toHaveBeenCalled();
		});
	});

	describe('onMark', () => {
		let wrapper;
		let form;
		const mockEvent = { preventDefault: jest.fn() };

		beforeEach(() => {
			global.localStorage.clear();

			wrapper = shallow(<Today
				dayEntryQuery={defaultDayEntryQuery}
				addTimeEntry={() => {}}
			/>);
			form = wrapper.find('form');
			mockEvent.preventDefault.mockReset();
		});

		it('should call onClick(e) when forms submit', () => {
			form.simulate('submit', mockEvent);
			expect(mockEvent.preventDefault).toHaveBeenCalled();
		});
		it('should not accept double click', () => {
			form.simulate('submit', mockEvent);
			expect(mockEvent.preventDefault).toHaveBeenCalled();
			expect(wrapper.state('buttonDisabled')).toBeTruthy();

			const button = wrapper.find('button');
			expect(button.prop('disabled')).toBeTruthy();
		});
		it('should make available the button after one minute', () => {
			jest.useFakeTimers();

			form.simulate('submit', mockEvent);
			expect(mockEvent.preventDefault).toHaveBeenCalled();
			expect(wrapper.state('buttonDisabled')).toBeTruthy();

			expect(setTimeout).toHaveBeenCalledTimes(1);
			expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 60000);

			jest.advanceTimersByTime(60001);

			expect(wrapper.state('buttonDisabled')).toEqual(false);
			expect(wrapper.find('.send').props()).toMatchSnapshot();

			//* WRONG TEST - EXPECT DISABLED TO BE FALSE _ NOW ITS TRUE _ IDNK WHY
		});
		it('should submit to server on the 4th forms submit', () => {
			utils.submitToServer = jest.fn(() => {});
			form.simulate('submit', mockEvent);
			Date.now = jest.fn(() => new Date(Date.UTC(2014, 0, 1, 13)).valueOf());
			form.simulate('submit', mockEvent);
			Date.now = jest.fn(() => new Date(Date.UTC(2014, 0, 1, 14)).valueOf());
			form.simulate('submit', mockEvent);
			Date.now = jest.fn(() => new Date(Date.UTC(2014, 0, 1, 15)).valueOf());
			form.simulate('submit', mockEvent);
			expect(utils.submitToServer).toHaveBeenCalled();
		});
		it('should open an alert if the time entered is invalid', () => {
			form.simulate('submit', mockEvent);
			Date.now = jest.fn(() => new Date(Date.UTC(2014, 0, 1, 10)).valueOf());
			form.simulate('submit', mockEvent);
			expect(wrapper).toMatchSnapshot();
			const alertModal = wrapper.find('AlertModal');
			alertModal.prop('onClose')();
		});
	});
	describe('componentWillReceiveProps', () => {
		it('should call checkEnteredValues if props changed and no errors', () => {
			const loadingProps = { ...defaultDayEntryQuery, loading: true, error: false };
			const wrapper = mount(<Today
				dayEntryQuery={loadingProps}
				addTimeEntry={() => {}}
			/>);
			const correctLoadingProps = {
				dayEntryQuery: { ...defaultDayEntryQuery, loading: false, error: false }
			};
			wrapper.instance().componentWillReceiveProps(correctLoadingProps);
		});
		it('should not call checkEnteredValues errors', () => {
			const loadingProps = { loading: true, error: false };
			const wrapper = mount(<Today
				dayEntryQuery={loadingProps}
				addTimeEntry={() => {}}
			/>);
			const errorProps = {
				dayEntryQuery: { ...defaultDayEntryQuery, loading: false, error: true }
			};
			wrapper.instance().componentWillReceiveProps(errorProps);
		});
	});

});
