import React from 'react';
import PropTypes from 'prop-types';

import '../../styles/spinner.styl';

const Spinner = props => (
	<div className={`spinner ${props.class}`}>
		<div className="rect1" />
		<div className="rect2" />
		<div className="rect3" />
		<div className="rect4" />
		<div className="rect5" />
	</div>
);

Spinner.propTypes = {
	class: PropTypes.string
};

Spinner.defaultProps = {
	class: ''
};

export default Spinner;
