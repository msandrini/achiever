import React from 'react';
import strings from '../../../shared/strings';

const PageLoading = () => (
	<div className="page-wrapper">
		<h2 className="current-date">
			{' '}
		</h2>
		<div className="column">
			&nbsp;
		</div>
		<div className="column page-not-found">
			{strings.pageLoading}
		</div>
	</div>
);

export default PageLoading;
