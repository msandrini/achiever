/* global window */

import React from 'react';
import Link from '../components/router/Link';

import strings from '../../shared/strings';

import '../styles/header.styl';

const onClickLogout = (event) => {
	event.preventDefault();
	/* eslint no-alert: "off" */
	const shouldLogout = window.confirm(strings.logoutConfirm);
	if (shouldLogout) {
		console.log('logout');
	}
};

const _getNav = () => {
	const loggedIn = true; // TODO
	if (loggedIn) {
		return (
			<nav>
				<Link to="/today" activeClassName="is-active">
					{strings.todayPage}
				</Link>
				<Link to="/edit" activeClassName="is-active">
					{strings.editPage}
				</Link>
				<button className="logout" onClick={onClickLogout}>
					{strings.logout}
				</button>
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
