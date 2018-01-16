/* global window */

import React from 'react';
import Menu from './router/Menu';

import UserDetails from './authentication/UserDetails';
import '../styles/header.styl';

const _getNav = () => (
	<nav>
		<Menu />
		<UserDetails />
	</nav>
);

const Header = () => (
	<div className="header-container">
		<header>
			<h1>Achiever</h1>
			{_getNav()}
		</header>
	</div>
);

export default Header;
