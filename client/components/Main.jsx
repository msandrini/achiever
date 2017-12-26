import React from 'react';
import { HashRouter, Route, Redirect, Switch } from 'react-router-dom';

import Header from './Header';
import Edit from './Edit';
import Today from './Today';
import Login from './Login';
import Logout from './Logout';
import PrivateRoute from './authentication/PrivateRoute';

import '../styles/main.styl';

const Main = () => (
	<HashRouter>
		<div className="root-container">
			<Header />
			<div className="time-management-container">
				<div>
					<Switch>
						<PrivateRoute path="/edit" component={Edit} />
						<PrivateRoute path="/today" component={Today} />
						<Route path="/login" component={Login} />
						<Route path="/logout" component={Logout} />
						<Redirect from="/" to="/edit" />
					</Switch>
				</div>
			</div>
		</div>
	</HashRouter>
);

export default Main;
