import React from 'react';
import PropTypes from 'prop-types';

import '../styles/errorPanel.styl';

const ErrorPanel = ({ message }) => {
	if (message) {
		return (
			<div className="errorPanel">
				<div className="icon">
					<img alt="" src="assets/ic_report_problem_white_24px.svg" />
				</div>
				<div className="message">
					{message}
				</div>
			</div>
		);
	}

	return '';
};

export default ErrorPanel;

ErrorPanel.propTypes = {
	message: PropTypes.string
};

ErrorPanel.defaultProps = {
	message: null
};
