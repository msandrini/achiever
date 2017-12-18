import React from 'react';
import { HashRouter, Route } from 'react-router-dom';
import Header from './Header';
import Edit from './Edit';
import Today from './Today';

import '../styles/main.styl';

const Main = () => (
	<div className="root-container">
		<Header />
		<div className="time-management-container">
			<HashRouter>
				<div>
					<Route path="/edit" component={Edit} />
					<Route exact path="/" component={Today} />
				</div>
			</HashRouter>
		</div>
	</div>
);

export default Main;
