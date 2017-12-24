import React from 'react';
import PropTypes from 'prop-types';

import '../styles/successPanel.styl';

const SuccessPanel = ({ message }) => {
	if (message) {
		return (
			<div className="successPanel">
				<div className="icon">
					<img alt="" src="assets/ic_check_circle_white_24px.svg" />
				</div>
				<div className="message">
					{message}
				</div>
			</div>
		);
	}

	return '';
};

export default SuccessPanel;

SuccessPanel.propTypes = {
	message: PropTypes.string
};

SuccessPanel.defaultProps = {
	message: null
};
