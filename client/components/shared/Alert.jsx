import React from 'react';
import PropTypes from 'prop-types';

const Alert = ({ errorMessage }) => {
	if (errorMessage) {
		return (
			<div className="error">
				<div className="icon">
					<img alt="" src="../../assets/ic_report_problem_white_24px.svg" />
				</div>
				<div className="message">
					{errorMessage}
				</div>
			</div>
		);
	}
	return '';
};

Alert.propTypes = {
	errorMessage: PropTypes.string,
};

Alert.defaultProps = {
	errorMessage: ''
};

export default Alert;
