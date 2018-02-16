const cheerio = require('cheerio');
const {
	getBalance
} = require('./middleware');

const generateTableLine = (date, balance) => (`
<tr>
	<td>${date}</td>
	<td></td>
	<td></td>
	<td></td>
	<td></td>
	<td></td>
	<td></td>
	<td></td>
	<td>&nbsp;${balance}</td>
	<td></td>
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
});
