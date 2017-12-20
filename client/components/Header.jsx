import React from 'react';
import { NavLink } from 'react-router-dom';

import strings from '../../shared/strings';

import '../styles/header.styl';

const Header = () => (
	<div className="header-container">
		<header>
			<h1>Achiever</h1>
			<nav>
				<NavLink to="/today" activeClassName="is-active">
					{strings.todayPage}
				</NavLink>
				<NavLink to="/edit" activeClassName="is-active">
					{strings.editPage}
				</NavLink>
			</nav>
		</header>
	</div>
);

export default Header;
