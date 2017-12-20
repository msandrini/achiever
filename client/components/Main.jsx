import React from 'react';
import { HashRouter, Route } from 'react-router-dom';
import Header from './Header';
import Edit from './Edit';
import Today from './Today';

import '../styles/main.styl';

const Main = () => (
	<HashRouter>
		<div className="root-container">
			<Header />
			<div className="time-management-container">
				<div>
					<Route path="/edit" component={Edit} />
					<Route exact path="/" component={Today} />
				</div>
			</div>
		</div>
	</HashRouter>
);

export default Main;
