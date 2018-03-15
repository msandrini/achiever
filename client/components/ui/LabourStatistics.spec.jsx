import React from 'react';
import { shallow } from 'enzyme';

import LabourStatistics from './LabourStatistics';

const defaultProps = {
	totalBalance: 0,
	contractedTime: 8 * 60,
	dayBalance: 8 * 60,
	weekBalance: 8 * 60 * 2,
	weekDay: 3
};

describe('LabourStatistics', () => {
	describe('render', () => {
		it('should properly render with surplus or debit', () => {
			const wrapperSurplus = shallow(<LabourStatistics />);
			const wrapperDebt = shallow(<LabourStatistics />);

			wrapperDebt.setProps(defaultProps);
			wrapperSurplus.setProps({ ...defaultProps, weekBalance: 8 * 60 * 4 });
			expect(wrapperDebt).toMatchSnapshot();
			expect(wrapperSurplus).toMatchSnapshot();
		});
	});
});
