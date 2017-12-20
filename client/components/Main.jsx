import React from 'react';
import { HashRouter, Route, Redirect, Switch } from 'react-router-dom';

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
					<Switch>
						<Route path="/edit" component={Edit} />
						<Route exact path="/today" component={Today} />
						<Redirect from="/" to="/today" />
					</Switch>
				</div>
			</div>
		</div>
	</HashRouter>
);

export default Main;
