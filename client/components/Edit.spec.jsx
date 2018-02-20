import React from 'react';
import moment from 'moment-timezone';
import { shallow } from 'enzyme';

import Edit from './Edit';

import * as utils from '../utils';
import strings from '../../shared/strings';

Date.now = jest.fn(() => new Date(Date.UTC(2018, 1, 15, 12)).valueOf());
Math.random = jest.fn(() => 12345);

const defaultProps = {
	addTimeEntry: jest.fn(),
	updateTimeEntry: jest.fn(),
	userDetailsQuery: {
		refetch: jest.fn(),
		loading: true,
		userDetails: {
			name: 'JOHN DOE',
			dailyContractedHours: '8:00',
			lastFridayBalance: ' 1:00',
			__typename: 'UserDetails'
		},
		error: false
	},
	weekEntriesQuery: {
		refetch: jest.fn(),
		loading: true,
		error: false,
		weekEntries: {
			timeEntries: [
				{
					date: '2018-02-11',
					phase: 'Project Phase Name',
					activity: 'Code/ Document Reviews',
					startTime: '',
					startBreakTime: '',
					endBreakTime: '',
					endTime: '',
					total: '',
					__typename: 'TimeEntry'
				},
				{
					date: '2018-02-12',
					phase: 'Project Phase Name',
					activity: 'Code/ Document Reviews',
					startTime: '9:28',
					startBreakTime: '11:35',
					endBreakTime: '12:35',
					endTime: '17:28',
					total: '7:00',
					__typename: 'TimeEntry'
				},
				{
					date: '2018-02-13',
					phase: 'Project Phase Name',
					activity: 'Code/ Document Reviews',
					startTime: '9:28',
					startBreakTime: '11:35',
					endBreakTime: '12:35',
					endTime: '18:28',
					total: '8:00',
					__typename: 'TimeEntry'
				},
				{
					date: '2018-02-14',
					phase: 'Project Phase Name',
					activity: 'Code/ Document Reviews',
					startTime: '',
					startBreakTime: '',
					endBreakTime: '',
					endTime: '',
					total: '',
					__typename: 'TimeEntry'
				},
				{
					date: '2018-02-15',
					phase: 'Project Phase Name',
					activity: 'Code/ Document Reviews',
					startTime: '',
					startBreakTime: '',
					endBreakTime: '',
					endTime: '',
					total: '',
					__typename: 'TimeEntry'
				},
				{
					date: '2018-02-16',
					phase: 'Project Phase Name',
					activity: 'Code/ Document Reviews',
					startTime: '',
					startBreakTime: '',
					endBreakTime: '',
					endTime: '',
					total: '',
					__typename: 'TimeEntry'
				},
				{
					date: '2018-02-17',
					phase: 'Project Phase Name',
					activity: 'Code/ Document Reviews',
					startTime: '',
					startBreakTime: '',
					endBreakTime: '',
					endTime: '',
					total: '',
					__typename: 'TimeEntry'
				}
			],
			total: '15:00'
		}
	},
	projectPhasesQuery: {
		refetch: jest.fn(),
		error: false,
		loading: true,
		phases: {
			default: 456,
			options: [
				{
					id: 456,
					name: 'Project Phase Name',
					activities: {
						default: 7,
						options: [
							{
								id: 6,
								name: 'BugFix'
							},
							{
								id: 7,
								name: 'Code/ Document Reviews'
							},
							{
								id: 9,
								name: 'Coding'
							},
							{
								id: 65,
								name: 'Absence / Compensation'
							}
						]
					}
				},
				{
					id: 445,
					name: 'Super cool project that just has bugs!',
					activities: {
						default: 6,
						options: [
							{
								id: 6,
								name: 'BugFix'
							},
							{
								id: 10,
								name: 'Test fix'
							}
						]
					}
				}
			]
		}
	}
};

describe('Edit', () => {
	let wrapper;
	beforeEach(() => {
		wrapper = shallow(<Edit
			addTimeEntry={defaultProps.addTimeEntry}
			updateTimeEntry={defaultProps.updateTimeEntry}
			weekEntriesQuery={defaultProps.weekEntriesQuery}
			projectPhasesQuery={defaultProps.projectPhasesQuery}
			userDetailsQuery={defaultProps.userDetailsQuery}
		/>);
	});
	describe('render', () => {
		it('should render with min props while loading', () => {
			expect(wrapper).toMatchSnapshot();
		});
		describe('should propagate values after props finished loading', () => {
			it('and all data but today', () => {
				const finishedLoading = {
					userDetailsQuery: {
						...defaultProps.userDetailsQuery,
						loading: false
					},
					weekEntriesQuery: {
						...defaultProps.weekEntriesQuery,
						loading: false
					},
					projectPhasesQuery: {
						...defaultProps.projectPhasesQuery,
						loading: false
					}
				};
				wrapper.setProps({
					addTimeEntry: defaultProps.addTimeEntry,
					updateTimeEntry: defaultProps.updateTimeEntry,
					weekEntriesQuery: finishedLoading.weekEntriesQuery,
					projectPhasesQuery: finishedLoading.projectPhasesQuery,
					userDetailsQuery: finishedLoading.userDetailsQuery
				});
				expect(wrapper).toMatchSnapshot();
			});
			it('and all data with today', () => {
				const finishedLoading = {
					userDetailsQuery: {
						...defaultProps.userDetailsQuery,
						loading: false
					},
					weekEntriesQuery: {
						...defaultProps.weekEntriesQuery,
						loading: false,
						weekEntries: {
							...defaultProps.weekEntriesQuery.weekEntries,
							timeEntries: [...defaultProps.weekEntriesQuery.weekEntries.timeEntries]

						}
					},
					projectPhasesQuery: {
						...defaultProps.projectPhasesQuery,
						loading: false
					}
				};
				const today = finishedLoading.weekEntriesQuery.weekEntries.timeEntries[4];
				today.startTime = '8:00';
				today.startBreakTime = '12:00';
				today.endBreakTime = '13:00';
				today.endTime = '17:00';
				today.total = '8:00';

				wrapper.setProps({
					addTimeEntry: defaultProps.addTimeEntry,
					updateTimeEntry: defaultProps.updateTimeEntry,
					weekEntriesQuery: finishedLoading.weekEntriesQuery,
					projectPhasesQuery: finishedLoading.projectPhasesQuery,
					userDetailsQuery: finishedLoading.userDetailsQuery
				});
				expect(wrapper).toMatchSnapshot();
			});
			it('and any error occured', () => {
				const finishedLoading = {
					weekEntriesQuery: {
						...defaultProps.weekEntriesQuery,
						loading: false,
						error: 'Super error message from week query'
					},
					projectPhasesQuery: {
						...defaultProps.projectPhasesQuery,
						error: 'Super error message from project query',
						loading: false
					}
				};
				wrapper.setProps({
					addTimeEntry: defaultProps.addTimeEntry,
					updateTimeEntry: defaultProps.updateTimeEntry,
					weekEntriesQuery: finishedLoading.weekEntriesQuery,
					projectPhasesQuery: defaultProps.projectPhasesQuery,
					userDetailsQuery: defaultProps.userDetailsQuery
				});
				expect(wrapper.state('errorMessage')).toEqual('Super error message from week query');

				wrapper.setProps({
					addTimeEntry: defaultProps.addTimeEntry,
					updateTimeEntry: defaultProps.updateTimeEntry,
					weekEntriesQuery: defaultProps.weekEntriesQuery,
					projectPhasesQuery: finishedLoading.projectPhasesQuery,
					userDetailsQuery: defaultProps.userDetailsQuery
				});
				expect(wrapper.state('errorMessage')).toEqual('Super error message from project query');
			});
		});
	});
	describe('_setPhaseAndActivityForChosenDate', () => {
		it('should handle holliday', () => {
			const holidayProps = {
				weekEntriesQuery: {
					...defaultProps.weekEntriesQuery,
					loading: false,
					weekEntries: {
						...defaultProps.weekEntriesQuery.weekEntries,
						timeEntries: [...defaultProps.weekEntriesQuery.weekEntries.timeEntries]
					}
				}
			};
			const monday = holidayProps.weekEntriesQuery.weekEntries.timeEntries[4];
			monday.activity = 'Holiday';

			wrapper.setProps({
				addTimeEntry: defaultProps.addTimeEntry,
				updateTimeEntry: defaultProps.updateTimeEntry,
				weekEntriesQuery: holidayProps.weekEntriesQuery,
				projectPhasesQuery: defaultProps.projectPhasesQuery,
				userDetailsQuery: defaultProps.userDetailsQuery
			});

			expect(wrapper.state('activity')).toEqual({ id: 99999, name: 'Holiday' });
		});
		it('should handle unknown activity', () => {
			const holidayProps = {
				weekEntriesQuery: {
					...defaultProps.weekEntriesQuery,
					loading: false,
					weekEntries: {
						...defaultProps.weekEntriesQuery.weekEntries,
						timeEntries: [...defaultProps.weekEntriesQuery.weekEntries.timeEntries]
					}
				}
			};
			const monday = holidayProps.weekEntriesQuery.weekEntries.timeEntries[4];
			monday.activity = 'Very strange and unkown';

			wrapper.setProps({
				addTimeEntry: defaultProps.addTimeEntry,
				updateTimeEntry: defaultProps.updateTimeEntry,
				weekEntriesQuery: holidayProps.weekEntriesQuery,
				projectPhasesQuery: defaultProps.projectPhasesQuery,
				userDetailsQuery: defaultProps.userDetailsQuery
			});

			expect(wrapper.state('activity')).toEqual({ id: 7, name: 'Code/ Document Reviews' });
		});
	});
	describe('onSetActivity', () => {
		it('should set the state as the activity selected', () => {
			const activeDayTaskWrapper = wrapper.find('ActiveDayTasks');
			const onSetActivity = activeDayTaskWrapper.prop('onActivitySelect');
			onSetActivity(65);
			expect(wrapper.state('activity')).toEqual({
				id: 65,
				name: 'Absence / Compensation'
			});
		});
	});
	describe('onSetProjectPhase', () => {
		it('should set the state phase and default activity', () => {
			const activeDayTaskWrapper = wrapper.find('ActiveDayTasks');
			const onPhaseSelect = activeDayTaskWrapper.prop('onPhaseSelect');
			onPhaseSelect(445);
			expect(wrapper.state('activity')).toEqual({
				id: 6,
				name: 'BugFix'
			});
		});
	});
	describe('onSubmit', () => {
		it('should set state as sent if sucess', async () => {
			const submitPromiseSuccess = Promise.resolve({ successMessage: 'Success!!' });
			utils.submitToServer = jest.fn(() => submitPromiseSuccess);
			const form = wrapper.find('form');
			form.simulate('submit', { preventDefault: jest.fn() });
			expect(utils.submitToServer).toHaveBeenCalled();

			await submitPromiseSuccess;

			expect(wrapper.state('sentToday')).toBeTruthy();
			const { sentToday } = utils.getTodayStorage();
			expect(sentToday).toBeTruthy();
			expect(defaultProps.weekEntriesQuery.refetch)
				.toHaveBeenCalledWith({ date: wrapper.state('controlDate').format('YYYY-MM-DD') });
		});
		it('should set state as error message if failure', async () => {
			const submitPromiseSuccess = Promise.resolve({ errorMessage: 'Failure!!' });
			utils.submitToServer = jest.fn(() => submitPromiseSuccess);
			const form = wrapper.find('form');
			form.simulate('submit', { preventDefault: jest.fn() });
			expect(utils.submitToServer).toHaveBeenCalled();

			await submitPromiseSuccess;

			expect(wrapper.state('sentToday')).toBeFalsy();
			expect(wrapper.state('errorMessage')).toEqual('Failure!!');
		});
	});
	describe('onTimeChange', () => {
		it('should set storedTimes labouredHoursOnDay hoursBalanceUpToDate', () => {
			const onTimeChange = wrapper.find('ActiveDayTimes').prop('onTimeChange');
			onTimeChange(0)(8, 30);
			expect(wrapper.state('storedTimes')).toEqual([
				{ hours: 8, minutes: 30 },
				{},
				{},
				{}
			]);
			onTimeChange(1)();
			expect(wrapper.state('storedTimes')).toEqual([
				{ hours: 8, minutes: 30 },
				{ hours: 0, minutes: 0 },
				{},
				{}
			]);
			onTimeChange(1)(12, 30);
			onTimeChange(2)(13, 0);
			onTimeChange(3)(17, 0);
			expect(wrapper.state('labouredHoursOnDay')).toEqual('8:00');
		});
	});
	describe('onDateChange', () => {
		it('should alert if controlDate is after today', () => {
			const onDateChange = wrapper.find('MonthlyCalendar').prop('onDateChange');
			onDateChange(moment('2018-02-20'));
			expect(wrapper.state('alertMessage')).toEqual(strings.cannotSelectFutureTime);
		});
		it('should change controlDate based on date', () => {
			const onDateChange = wrapper.find('MonthlyCalendar').prop('onDateChange');
			const feb2018 = moment('2018-02-14');
			onDateChange(feb2018);
			expect(wrapper.state('controlDate')).toEqual(feb2018);
			expect(wrapper.state('controlDateIsValid')).toBeTruthy();

			const jan2018 = moment('2018-01-15');
			onDateChange(jan2018);
			expect(wrapper.state('controlDate')).toEqual(jan2018);
			expect(wrapper.state('controlDateIsValid')).toBeFalsy();

			expect(defaultProps.weekEntriesQuery.refetch)
				.toHaveBeenCalledWith({ date: jan2018.format('YYYY-MM-DD') });
		});
	});
	describe('alertOnClose', () => {
		it('should null the alert message', () => {
			wrapper.setState({ alertMessage: 'super alert' });
			const onAlertClose = wrapper.find('AlertModal').prop('onClose');
			onAlertClose();
			expect(wrapper.state('alertMessage')).toBeNull();
		});
	});
});
