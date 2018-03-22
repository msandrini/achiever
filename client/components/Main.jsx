import React from 'react';

import AuthRedirect from './AuthRedirect';
import Header from './Header';

import './Main.styl';

const Main = () => (
	<div className="root-container">
		<Header />
		<AuthRedirect />
	</div>
);

export default Main;
