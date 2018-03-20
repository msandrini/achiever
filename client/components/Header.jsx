/* global window */

import React from 'react';

import UserDetails from './authentication/UserDetails';

import './Header.styl';

const Header = () => (
	<div className="header-container">
		<header>
			<h1>Achiever</h1>
			<UserDetails />
		</header>
	</div>
);

export default Header;
