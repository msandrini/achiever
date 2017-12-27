import React from 'react';
import strings from '../../../shared/strings';

const PageNotFound = () => (
	<div className="page-wrapper">
		<h2 className="current-date">
			{' '}
		</h2>
		<div className="column">
			&nbsp;
		</div>
		<div className="column page-not-found">
			{strings.pageNotFound}
			<button
				className="send"
				type="button"
				onClick={() => window.history.back()}
			>
				{strings.goBack}
			</button>
		</div>
	</div>
);

export default PageNotFound;
