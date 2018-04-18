const cheerio = require('cheerio');
const {
	extractChangePasswordData
} = require('./changePassword');

const generateHtml = ({
	id,
	atkprevlevel,
	atkstackid,
	achievo,
	atkescape,
	atkaction,
	atknodetype,
	atkprimkey,
	userid,
	passwordHash,
	atknoclose
}) => (`
<input type="hidden" name="atkprevlevel" value="${atkprevlevel}">
<input type="hidden" name="atkstackid" value="${atkstackid}">
<input type="hidden" name="achievo" value="${achievo}">
<input type="hidden" name="atkescape" value="${atkescape}">
<input type="hidden" name="atkaction" value="${atkaction}">
<input type="hidden" name="atknodetype" value="${atknodetype}">
<input type="hidden" name="atkprimkey" value="${atkprimkey}">
<input type="hidden" name="id" value="${id}">
<input type="hidden" name="userid" value="${userid}">
<input type="hidden" name="password[hash]" value="${passwordHash}">
<input type="submit" class="btn_save" name="atknoclose" value="${atknoclose}">
`);

describe('changePassword', () => {
	describe('extractChangePasswordData()', () => {
		it('should return the changePasswordData correctly', () => {
			const targetOutput = {
				id: '123',
				atkprevlevel: '0',
				atkstackid: '1234567890123',
				achievo: '1e373a93f8901ae9c3971948c80b5fe7',
				atkescape: '',
				atkaction: 'update',
				atknodetype: 'employee.userprefs',
				atkprimkey: 'person.id=\'123\'',
				userid: 'johndoe',
				passwordHash: '12345678901234567890123456789012',
				atknoclose: 'Save'
			};

			const baseHtml = generateHtml(targetOutput);
			const $ = cheerio.load(baseHtml);
			const result = extractChangePasswordData($);
			expect(result).toEqual(targetOutput);
		});
	});
});
