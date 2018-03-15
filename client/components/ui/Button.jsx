import React from 'react';
import PropTypes from 'prop-types';

import './Button.styl';

const Button = ({ label, isDisabled, isHidden }) => (
	<div>
		{ !isHidden ?
			<button
				type="submit"
				className="Button"
				disabled={isDisabled}
			>
				{label}
			</button> : ''
		}
	</div>
);

export default Button;

Button.propTypes = {
	label: PropTypes.string.isRequired,
	isDisabled: PropTypes.bool,
	isHidden: PropTypes.bool
};

Button.defaultProps = {
	isDisabled: false,
	isHidden: false
};
