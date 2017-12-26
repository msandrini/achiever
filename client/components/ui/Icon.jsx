import React from 'react';
import PropTypes from 'prop-types';

const Icon = ({ type }) => (
	<svg viewBox="0 0 24 24">
		<use xlinkHref={`/assets/icons.svg#${type}`} />
	</svg>
);

Icon.propTypes = {
	type: PropTypes.string.isRequired
};

export default Icon;
