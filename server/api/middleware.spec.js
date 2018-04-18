const cheerio = require('cheerio');
const {
	getBalance,
	extractBreakTime,
	allTimesTableToData
} = require('./middleware');

const generateTableLine = (
	date,
	balance,
	contractedTime,
	startTime,
	endTime,
	startBreakTime,
	endBreakTime,
	total,
	remarks
) => (`
<tr>
	<td>${date}</td>
	<td>${contractedTime}</td>
	<td>${startTime}</td>
	<td>${total}</td>
	<td>My break started at ${startBreakTime} and finished at ${endBreakTime}</td>
	<td>${endTime}</td>
	<td></td>
	<td></td>
	<td>&nbsp;${balance}</td>
	<td>${remarks}</td>
</tr>
`);

const TABLE_HEADER = `
	<tr>
		<th>Date</th>
		<th>Contracted</th>
		<th>Entry</th>
		<th>Working Time</th>
		<th>Breaks</th>
		<th>End time</th>
		<th>Daily Compensation</th>
		<th>Daily Overtime</th>
		<th>Balance</th>
		<th>Remarks</th>
	</tr>
`;

describe('middleware', () => {
	describe('getBalance()', () => {
		const targetBalance = '2:00';

		it('should return last FRIDAY 8th td WHEN first tr-td is MONDAY', () => {
			const baseHtml = `
				<table>
					${generateTableLine('2018-02-05 Mon', '5:00')}
					${generateTableLine('2018-02-02 Fri', targetBalance)}
				</table>
			`;
			const $ = cheerio.load(baseHtml);
			const result = getBalance($);
			expect(result).toEqual(targetBalance);
		});

		it('should return last FRIDAY 8th td WHEN it has header in the middle', () => {
			const baseHtml = `
				<table>
					${generateTableLine('2018-02-07 Web', '7:00')}
					${TABLE_HEADER}
					${generateTableLine('2018-02-06 Tue', '6:00')}
					${TABLE_HEADER}
					${generateTableLine('2018-02-05 Mon', '5:00')}
					${TABLE_HEADER}
					${generateTableLine('2018-02-02 Fri', targetBalance)}
				</table>
			`;
			const $ = cheerio.load(baseHtml);
			const result = getBalance($);
			expect(result).toEqual(targetBalance);
		});

		it('should return 8th td when the first tr-td is FRIDAY', () => {
			const baseHtml = `
				<table>
					${generateTableLine('2018-02-02 Fri', targetBalance)}
				</table>
			`;
			const $ = cheerio.load(baseHtml);
			const result = getBalance($);
			expect(result).toEqual(targetBalance);
		});
	});

	describe('extractBreakTime()', () => {
		it('should extract the time from a given string', () => {
			const breakTime = 'You have started your break time at 11:30:00 and have finished it by 12:34:56';
			expect(extractBreakTime(breakTime)).toEqual({
				startBreakTime: '11:30:00',
				endBreakTime: '12:34:56'
			});
		});

		it('should return empty strings when no break time is defined', () => {
			const breakTime = 'You have no break time by the moment';
			expect(extractBreakTime(breakTime)).toEqual({
				startBreakTime: '',
				endBreakTime: ''
			});
		});
	});

	describe('allTimesTableToData()', () => {
		it('should return the report HTML as object', () => {
			const expected = {
				date: '2018-03-06',
				contractedTime: '8:00',
				startTime: '7:00',
				endTime: '16:00',
				startBreakTime: '11:45:00',
				endBreakTime: '12:45:00',
				total: '8:00',
				balance: '34:56',
				holiday: null,
				isHoliday: false,
				isVacation: false,
				isJustifiedAbsence: false,
				isOtanjoubi: false
			};
			const baseHtml = `
<table>
	${generateTableLine(
		`${expected.date} Tue`,
		expected.balance,
		expected.contractedTime,
		expected.startTime,
		expected.endTime,
		expected.startBreakTime,
		expected.endBreakTime,
		expected.total
	)}
</table>
			`;

			const $ = cheerio.load(baseHtml);
			const result = allTimesTableToData($);
			expect(result).toEqual([expected]);
		});

		it('should return the flag isHoliday as TRUE', () => {
			const expected = {
				date: '2017-12-25',
				contractedTime: '8:00',
				startTime: '8:00',
				endTime: '17:00',
				startBreakTime: '',
				endBreakTime: '',
				total: '8:00',
				balance: '34:56',
				holiday: 'Xmas',
				isHoliday: true,
				isVacation: false,
				isJustifiedAbsence: false,
				isOtanjoubi: false
			};
			const baseHtml = `
<table>
	${generateTableLine(
		`${expected.date} Tue  Holiday`,
		expected.balance,
		expected.contractedTime,
		expected.startTime,
		expected.endTime,
		expected.startBreakTime,
		expected.endBreakTime,
		expected.total,
		expected.holiday
	)}
</table>
			`;

			const $ = cheerio.load(baseHtml);
			const result = allTimesTableToData($);
			expect(result).toEqual([expected]);
		});

		it('should return the flag isJustifiedAbsence as TRUE', () => {
			const expected = {
				date: '2017-12-25',
				contractedTime: '8:00',
				startTime: '8:00',
				endTime: '17:00',
				startBreakTime: '',
				endBreakTime: '',
				total: '8:00',
				balance: '34:56',
				holiday: null,
				isHoliday: false,
				isVacation: false,
				isJustifiedAbsence: true,
				isOtanjoubi: false
			};
			const baseHtml = `
<table>
	${generateTableLine(
		`${expected.date} Tue  Holiday`,
		expected.balance,
		expected.contractedTime,
		expected.startTime,
		expected.endTime,
		expected.startBreakTime,
		expected.endBreakTime,
		expected.total,
		'Justified Absence'
	)}
</table>
			`;

			const $ = cheerio.load(baseHtml);
			const result = allTimesTableToData($);
			expect(result).toEqual([expected]);
		});

		it('should return the flag isOtanjoubi as TRUE', () => {
			const expected = {
				date: '2017-12-25',
				contractedTime: '8:00',
				startTime: '8:00',
				endTime: '17:00',
				startBreakTime: '',
				endBreakTime: '',
				total: '8:00',
				balance: '34:56',
				holiday: null,
				isHoliday: false,
				isVacation: false,
				isJustifiedAbsence: false,
				isOtanjoubi: true
			};
			const baseHtml = `
<table>
	${generateTableLine(
		`${expected.date} Tue  Holiday`,
		expected.balance,
		expected.contractedTime,
		expected.startTime,
		expected.endTime,
		expected.startBreakTime,
		expected.endBreakTime,
		expected.total,
		'O-Tanjoubi'
	)}
</table>
			`;

			const $ = cheerio.load(baseHtml);
			const result = allTimesTableToData($);
			expect(result).toEqual([expected]);
		});
	});
});
