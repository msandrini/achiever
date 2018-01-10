/* global window */

import React from 'react';
import Link from '../components/router/Link';

import strings from '../../shared/strings';
import UserDetails from './authentication/UserDetails';
import '../styles/header.styl';
import { getAuthToken } from './authentication/token';

const _getNav = () => {
	const authenticated = Boolean(getAuthToken());

	if (authenticated) {
		return (
			<nav>
				<Link to="/today" activeClassName="is-active">
					{strings.todayPage}
				</Link>
				<Link to="/edit" activeClassName="is-active">
					{strings.editPage}
				</Link>
				<UserDetails />
			</nav>
		);
	}
	return (
		<nav className="unlogged">
			<UserDetails />
		</nav>
	);
};

const Header = () => (
	<div className="header-container">
		<header>
			<h1>Achiever</h1>
			{_getNav()}
		</header>
	</div>
);

export default Header;
