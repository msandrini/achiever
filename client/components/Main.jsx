import React from 'react';

import ShowComponentOnRoute from './Router';
import Header from './Header';

import './Main.styl';

const Main = () => (
	<div className="root-container">
		<Header />
		<div className="time-management-container">
			<div>
				<ShowComponentOnRoute path={window.location.pathname} />
			</div>
		</div>
	</div>
);

export default Main;
