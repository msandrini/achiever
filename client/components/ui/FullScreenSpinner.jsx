import React from 'react';
import PropTypes from 'prop-types';

import Spinner from '../ui/Spinner';

import './FullScreenSpinner.styl';

const FullScreenSpinner = props => (
	props.active ?
		(
			<div className="full-screen-spinner-layer">
				<Spinner
					class="loadingPage"
				/>
			</div>
		)
		: ''
);

FullScreenSpinner.propTypes = {
	active: PropTypes.bool
};

FullScreenSpinner.defaultProps = {
	active: false
};

export default FullScreenSpinner;
