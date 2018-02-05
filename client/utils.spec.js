import moment from 'moment';

import strings from '../shared/strings';
import * as utils from './utils';

Date.now = jest.fn(() => new Date(Date.UTC(2014, 0, 1, 12)).valueOf());

const weekTimeEnries = [
	{
		activity: 'Code/ Document Reviews',
		date: '2014-01-05',
		endBreakTime: '',
		endTime: '',
		phase: 'Project Phase Name',
		startBreakTime: '',
		startTime: '',
		total: ''
	},
	{
		activity: 'Code/ Document Reviews',
		date: '2014-01-06',
		endBreakTime: '13:00',
		endTime: '18:00',
		phase: 'Project Phase Name',
		startBreakTime: '12:00',
		startTime: '08:00',
		total: '9:00'
	},
	{
		activity: 'Code/ Document Reviews',
		date: '2014-01-07',
		endBreakTime: '13:00',
		endTime: '18:00',
		phase: 'Project Phase Name',
		startBreakTime: '12:00',
		startTime: '08:00',
		total: '9:00'
	},
	{
		activity: 'Code/ Document Reviews',
		date: '2014-01-08',
		endBreakTime: '12:00',
		endTime: '13:00',
		phase: 'Project Phase Name',
		startBreakTime: '11:00',
		startTime: '10:00',
		total: ''
	},
	{
		activity: 'Code/ Document Reviews',
		date: '2014-01-09',
		endBreakTime: '',
		endTime: '',
		phase: 'Project Phase Name',
		startBreakTime: '',
		startTime: '',
		total: ''
	},
	{
		activity: 'Code/ Document Reviews',
		date: '2014-01-10',
		endBreakTime: '',
		endTime: '',
		phase: 'Project Phase Name',
		startBreakTime: '',
		startTime: '',
		total: ''
	},
	{
		activity: 'Code/ Document Reviews',
		date: '2014-01-11',
		endBreakTime: '',
		endTime: '',
		phase: 'Project Phase Name',
		startBreakTime: '',
		startTime: '',
		total: ''
	}
];


describe('client/utils', () => {
	beforeEach(() => {
		global.localStorage.clear();
	});
	describe('areTheSameDay', () => {
		it('should check if two moments are the same day', () => {
			const sameDays = utils.areTheSameDay(moment('2012-01-01'), moment('2012-01-01'));
			expect(sameDays).toBeTruthy();
			const notsameDays = utils.areTheSameDay(moment('2012-01-01'), moment('2012-01-02'));
			expect(notsameDays).toBeFalsy();
		});
	});
	describe('replacingValueInsideArray', () => {
		it('should change the value of an item on an array and return the new array', () => {
			let ar = [0, 1, 2, 3, 3, 5, 6];
			ar = utils.replacingValueInsideArray(ar, 4, 4);
			expect(ar[4]).toEqual(4);
		});
	});
	describe('setTodayStorage', () => {
		it('should insert data on key localstorage with today date', () => {
			utils.setTodayStorage('teste');

			const dayKeyStg = global.localStorage.getItem(utils.STORAGEDAYKEY).split('"').join('');
			expect(Number(dayKeyStg)).toEqual(moment().valueOf());

			const stgKey = global.localStorage.getItem(utils.STORAGEKEY).split('"').join('');
			expect(stgKey).toEqual('teste');
		});
	});
	describe('getTodayStorage', () => {
		it('should get today localStorage', () => {
			utils.setTodayStorage('teste');
			expect(utils.getTodayStorage()).toEqual('teste');
		});
		it('should return an empty storage if is another day', () => {
			const emptyStorage = { storedTimes: [{}, {}, {}, {}], sentToday: false };
			utils.setTodayStorage('teste');
			Date.now = jest.fn(() => new Date(Date.UTC(2014, 0, 2, 12)).valueOf());
			expect(utils.getTodayStorage()).toEqual(emptyStorage);
		});
	});
	describe('clearTodayStorage', () => {
		it('should clear localStorage', () => {
			utils.setTodayStorage('teste');
			expect(global.localStorage.getItem(utils.STORAGEDAYKEY)).not.toBeNull();
			expect(global.localStorage.getItem(utils.STORAGEKEY)).not.toBeNull();
			utils.clearTodayStorage();
			expect(global.localStorage.getItem(utils.STORAGEDAYKEY)).toBeNull();
			expect(global.localStorage.getItem(utils.STORAGEKEY)).toBeNull();
		});
	});
	describe('submitToServer', () => {
		let date;
		let storedTimes;
		let phase;
		let activity;

		beforeEach(() => {
			date = moment();
			storedTimes = [
				{ hours: 9, minutes: '00' },
				{ hours: 12, minutes: '00' },
				{ hours: 13, minutes: '00' },
				{ hours: 18, minutes: '00' }
			];
			phase = { id: 'great phase' };
			activity = { id: 'greate activity' };
		});

		it('should correctly prepare data to be added on timeEntry', async () => {
			const addTimeEntry = jest.fn(() => Promise.resolve('sucess!!!'));

			const retObj = await utils.submitToServer(date, storedTimes, phase, activity, addTimeEntry);

			expect(addTimeEntry).toHaveBeenCalled();
			expect(retObj).toEqual({ successMessage: strings.submitTimeSuccess });
		});
		it('should return error message if error at addTimeEntry', async () => {
			const addTimeEntry = jest.fn(() => Promise.reject({ graphQLErrors: [{ message: 'error' }] })); // eslint-disable-line

			const retObj = await utils.submitToServer(date, storedTimes, phase, activity, addTimeEntry);

			expect(retObj).toEqual({ errorMessage: 'error' });
			expect(addTimeEntry).toHaveBeenCalled();
		});
		it('should return nothing if response is empty', async () => {
			const addTimeEntry = jest.fn(() => Promise.resolve());

			const retObj = await utils.submitToServer(date, storedTimes, phase, activity, addTimeEntry);

			expect(retObj).toEqual({ successMessage: '' });
			expect(addTimeEntry).toHaveBeenCalled();
		});
	});
	describe('calculateLabouredHours', () => {
		it('should return the laboured hours on day considering the lunch time', () => {
			const storedTimes = [
				{ hours: 9, minutes: '00' },
				{ hours: 12, minutes: '00' },
				{ hours: 13, minutes: '00' },
				{ hours: 18, minutes: '00' }
			];
			expect(utils.calculateLabouredHours(storedTimes)).toEqual('8:00');
		});
	});
	describe('calculateHoursBalanceUpToDate', () => {
		it('should calculate contractHours and labouredHours up to controlDate', () => {
			//* not working
			const controlDate = moment('2014-01-08'); 			// Wednesday
			const labouredHoursOnDay = '';
			const contractedHoursForADay = '8:00';
			const timeEntries = weekTimeEnries;
			const hours = utils.calculateHoursBalanceUpToDate(
				controlDate,
				{ labouredHoursOnDay, contractedHoursForADay, timeEntries }
			);
			expect(hours.contractedHoursUpToDate.toHours()).toEqual(24);
			expect(hours.labouredHoursUpToDate.toHours()).toEqual(18);
		});
		it('should calculate contractHours and labouredHours with controlDate', () => {
			//* not working
			const controlDate = moment('2014-01-11'); 			// Saturday
			const labouredHoursOnDay = '5:00';
			const contractedHoursForADay = '8:00';
			const timeEntries = weekTimeEnries;
			const hours = utils.calculateHoursBalanceUpToDate(
				controlDate,
				{ labouredHoursOnDay, contractedHoursForADay, timeEntries }
			);
			expect(hours.contractedHoursUpToDate.toHours()).toEqual(40);
			expect(hours.labouredHoursUpToDate.toHours()).toEqual(23);
		});
	});
	describe('timesAreValid', () => {
		let times;

		beforeEach(() => {
			times = [
				{ hours: '08', minutes: '00' },
				{ hours: '12', minutes: '00' },
				{ hours: '13', minutes: '00' },
				{ hours: '18', minutes: '00' }
			];
		});

		it('should accept increasing hours', () => {
			expect(utils.timesAreValid(times)).toBeTruthy();
		});
		it('should not accept decreasing or stable hours', () => {
			times[2] = times[0];		// eslint-disable-line prefer-destructuring
			expect(utils.timesAreValid(times)).toBeFalsy();
			times[2] = times[1];		// eslint-disable-line prefer-destructuring
			expect(utils.timesAreValid(times)).toBeFalsy();
		});
		it('should not accept null objects', () => {
			times[0] = null;
			expect(utils.timesAreValid(times)).toBeFalsy();
		});
	});
	describe('dismemberTimeString', () => {
		it('should return an object {hours:minutes} given HH:MM', () => {
			expect(utils.dismemberTimeString('10:10')).toEqual({ hours: '10', minutes: '10' });
			expect(utils.dismemberTimeString('9:01')).toEqual({ hours: '9', minutes: '01' });
		});
	});
	describe('isDayBlockedInPast', () => {
		it('should block all days before last week if today is monday', () => {
			Date.now = jest.fn(() => new Date(Date.UTC(2018, 1, 5, 22)).valueOf());
			expect(utils.isDayBlockedInPast(moment('2018-02-01'))).toBeFalsy();
		});
		it('should block all days before last sunday', () => {
			Date.now = jest.fn(() => new Date(Date.UTC(2018, 1, 8, 12)).valueOf());
			expect(utils.isDayBlockedInPast(moment('2018-02-03'))).toBeTruthy();
		});
		it('should not block all days from today', () => {
			Date.now = jest.fn(() => new Date(Date.UTC(2018, 1, 9, 12)).valueOf());
			expect(utils.isDayBlockedInPast(moment('2018-03-08'))).toBeFalsy();
		});
	});
});

