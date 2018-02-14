import React from 'react';
import { shallow } from 'enzyme';
import TimeDuration from 'time-duration';

import LabourStatistics from './LabourStatistics';

const defaultProps = {
	dayHoursEntitled: '8:00',
	dayHoursLaboured: '8:00',
	rawBalance: '2:20',
	weekHoursEntitled: new TimeDuration(960),
	weekHoursLaboured: new TimeDuration(840)
};

describe('LabourStatistics', () => {
	describe('render', () => {
		it('should properly render with surplus or debit', () => {
			const wrapperSurplus = shallow(<LabourStatistics />);
			const wrapperDebt = shallow(<LabourStatistics />);

			wrapperDebt.setProps(defaultProps);
			wrapperSurplus.setProps({ ...defaultProps, weekHoursLaboured: new TimeDuration(1000) });
			expect(wrapperDebt).toMatchSnapshot();
			expect(wrapperSurplus).toMatchSnapshot();
		});
	});
});
