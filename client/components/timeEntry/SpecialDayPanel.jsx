import React from 'react';
import PropTypes from 'prop-types';

import strings from '../../../shared/strings';

import './SpecialDayPanel.styl';

const renderTag = content => <p className="special-day-panel">{content}</p>;

const SpecialDayPanel = ({ entry }) => {
	if (entry.isVacation) {
		return renderTag(strings.vacation || '');
	}
	if (entry.isHoliday) {
		return renderTag(entry.holiday || '');
	}
	return null;
};

SpecialDayPanel.propTypes = {
	isBirthdayLeave: PropTypes.bool,
	isMedicalAbsence: PropTypes.bool,
	onSelect: PropTypes.func
};

SpecialDayPanel.defaultProps = {
	isBirthdayLeave: false,
	isMedicalAbsence: false,
	onSelect: () => {}
};

export default SpecialDayPanel;
