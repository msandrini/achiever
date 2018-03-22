import React from 'react';
import PropTypes from 'prop-types';
import TimeDuration from 'time-duration';

import './BalanceBox.styl';

const formatValue = value => (new TimeDuration(value)).toString();

const BalanceBox = ({ description, value }) => (
	<div className="balance-box">
		{description} <strong>{formatValue(value)}</strong>
	</div>
);

export default BalanceBox;

BalanceBox.propTypes = {
	description: PropTypes.string.isRequired,
	value: PropTypes.number.isRequired
};
