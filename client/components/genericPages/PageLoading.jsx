import React from 'react';
import PropTypes from 'prop-types';

import Spinner from '../ui/Spinner';

import '../../styles/pageLoading.styl';

const PageLoading = props => (
	props.active ?
		(
			<div className="pageLoading-layer">
				<Spinner
					class="loadingPage"
				/>
			</div>
		)
		: ''
);

PageLoading.propTypes = {
	active: PropTypes.bool
};

PageLoading.defaultProps = {
	active: false
};

export default PageLoading;
