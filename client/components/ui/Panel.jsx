import React from 'react';
import PropTypes from 'prop-types';

import Icon from './Icon';

import '../../styles/panels.styl';

const Panel = ({ message, type }) => {
	if (message) {
		return (
			<div className={`panel ${type}`}>
				<div className="icon">
					<Icon type={type} />
				</div>
				<div className="message">
					{message}
				</div>
			</div>
		);
	}

	return null;
};

export default Panel;

Panel.propTypes = {
	type: PropTypes.oneOf(['success', 'error']).isRequired,
	message: PropTypes.string
};

Panel.defaultProps = {
	message: null
};
