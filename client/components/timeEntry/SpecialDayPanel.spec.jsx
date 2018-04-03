import React from 'react';
import { shallow } from 'enzyme';

import SpecialDayPanel from './SpecialDayPanel';

const defaultProps = {
	isBirthdayLeave: false,
	isMedicalAbstence: false,
	entry: {
		isVacation: false,
		isHoliday: false
	}
};

describe('SpecialDayPanel', () => {
	describe('render', () => {
		it('should not call renderTag if not vacation nor holiday', () => {
			const wrapper = shallow(<SpecialDayPanel
				entry={defaultProps.entry}
			/>);
			expect(wrapper).toMatchSnapshot();
		});
		it('should render holiday message', () => {
			const holidayPanel = { ...defaultProps.entry, isHoliday: true };
			const vacationPanel = { ...defaultProps.entry, isVacation: true };
			const wrapperHoliday = shallow(<SpecialDayPanel entry={holidayPanel} />);
			const wrapperVacation = shallow(<SpecialDayPanel entry={vacationPanel} />);

			expect(wrapperHoliday).toMatchSnapshot();
			expect(wrapperVacation).toMatchSnapshot();
		});
	});
});
