import React from 'react';
import PropTypes from 'prop-types';

import './Button.styl';

const Button = ({ label, isDisabled }) => (
	<button
		type="submit"
		className="Button"
		disabled={isDisabled}
	>
		{label}
	</button>
);

export default Button;

Button.propTypes = {
	label: PropTypes.string.isRequired,
	isDisabled: PropTypes.bool
};

Button.defaultProps = {
	isDisabled: false
};
