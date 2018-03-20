import React from 'react';

import AuthRedirect from './AuthRedirect';
import Header from './Header';

import './Main.styl';

const Main = () => (
	<div className="root-container">
		<Header />
		<div className="content-container">
			<AuthRedirect />
		</div>
	</div>
);

export default Main;
