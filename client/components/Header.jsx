/* global window */

import React from 'react';

import UserDetails from './authentication/UserDetails';

import './Header.styl';

const Header = () => (
	<header>
		<h1>Achiever</h1>
		<UserDetails />
	</header>
);

export default Header;
