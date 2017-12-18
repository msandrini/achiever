import React from 'react';
import { HashRouter, Route, Redirect, Switch } from 'react-router-dom';
import Header from './Header';
import Edit from './Edit';
import Today from './Today';

const Main = () => (
	<div className="root-container">
		<Header />
		<div className="time-management-container">
			<HashRouter>
				<Switch>	
					<Route path="/edit" component={Edit} />
					<Route exact path="/today" component={Today} />
					<Redirect from="/" to="/today" />
				</Switch>
			</HashRouter>
		</div>
	</div>
);

export default Main;
