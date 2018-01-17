import React from 'react';
import PropTypes from 'prop-types';

import Link from './Link';
import { onChangeLocation } from './history';
import { routeDefinitions } from './pages';

import { getAuthToken } from '../authentication/token';

class Menu extends React.Component {
	constructor(props) {
		super(props);
		this.authenticated = Boolean(getAuthToken());
		this.state = {
			path: window.location.pathname
		};
	}

	componentWillMount() {
		onChangeLocation((path) => {
			this.setState({ path });
		});
	}

	render() {
		return Object.keys(routeDefinitions).map((key) => {

			const isPrivateWithAuth = this.authenticated && routeDefinitions[key].private;
			const notPrivateWithoutAuth = !this.authenticated &&
				routeDefinitions[key].private === false;

			if (isPrivateWithAuth || notPrivateWithoutAuth) {
				return (
					<Link
						key={key}
						to={key}
						isActive={this.state.path === key}
					>
						{routeDefinitions[key].name}
					</Link>
				);
			}
			return null;
		});
	}
};


export default Menu;
