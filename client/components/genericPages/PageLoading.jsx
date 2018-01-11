import React from 'react';

import '../../styles/pageLoading.styl';

const PageLoading = () => (
	<div className="page-wrapper">
		<h2 className="current-date">
			{' '}
		</h2>
		<div className="column">
			&nbsp;
		</div>
		<div className="column">
			<div className="spinner">
				<div className="dot1" />
				<div className="dot2" />
			</div>
		</div>
	</div>
);

export default PageLoading;
