/* global window */

import React from 'react';
import { NavLink } from 'react-router-dom';

import strings from '../../shared/strings';
import UserDetails from './UserDetails';
import '../styles/header.styl';

const _getNav = () => {
	const loggedIn = true; // TODO
	if (loggedIn) {
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
	return <nav className="unlogged" />;
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
