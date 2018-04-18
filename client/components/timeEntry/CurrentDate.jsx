import React from 'react';
import PropTypes from 'prop-types';

import strings from '../../../shared/strings';

const CurrentDate = ({ selectedDate }) => (
	<h2 className="current-date">
		{strings.selectedDate}:{' '}
		<strong>{selectedDate ? selectedDate.format('L') : ''}</strong>
	</h2>
);

CurrentDate.propTypes = {
	selectedDate: PropTypes.object
};

CurrentDate.defaultProps = {
	selectedDate: { format: () => '---' }
};

export default CurrentDate;
