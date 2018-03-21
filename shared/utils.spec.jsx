import {
	checkValidity,
	timeIsValid,
	buildDateFromTimeString
} from './utils';

describe('shared/utils', () => {
	describe('checkValidity', () => {
		it('should check if a value is a valid hour or minute', () => {
			expect(checkValidity('hours', 10)).toBeTruthy();
			expect(checkValidity('minutes', 30)).toBeTruthy();
			expect(checkValidity('minutes', null)).toBeTruthy();
			expect(checkValidity('hours', 26)).toBeFalsy();
			expect(checkValidity('minutes', 75)).toBeFalsy();
			expect(checkValidity('minutes', 705)).toBeFalsy();
			expect(checkValidity('minutes', 'hi')).toBeFalsy();
		});
	});
	describe('timeIsValid', () => {
		it('should check fi {hh: mm} is a valid time', () => {
			expect(timeIsValid({ hours: 10, minutes: 30 })).toBeTruthy();
			expect(timeIsValid({ hours: 100, minutes: 100 })).toBeFalsy();
		});
	});
	describe('buildDateFromTimeString', () => {
		it('should return a date from HH:MM', () => {
			const year = new Date().getFullYear();
			const month = new Date().getMonth();
			const day = new Date().getDate();
			expect(Date(buildDateFromTimeString('10:10'))).toEqual(Date(year, month, day, 10, 10));
		});
	});
});
