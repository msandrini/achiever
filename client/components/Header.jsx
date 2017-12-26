/* global window */

import React from 'react';
import { NavLink } from 'react-router-dom';

import strings from '../../shared/strings';
import UserDetails from './UserDetails';
import '../styles/header.styl';
import { API_AUTH_TOKEN } from './Login';

const _getNav = () => {
	const token = localStorage.getItem(API_AUTH_TOKEN);
	const authenticated = Boolean(token);

	if (authenticated) {
		return (
			<nav>
				<NavLink to="/today" activeClassName="is-active">
					{strings.todayPage}
				</NavLink>
				<NavLink to="/edit" activeClassName="is-active">
					{strings.editPage}
				</NavLink>
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
