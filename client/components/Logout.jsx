import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import { API_AUTH_TOKEN } from './Login';

class Logout extends Component {
	componentWillMount() {
		localStorage.removeItem(API_AUTH_TOKEN);
	}

	render() {
		return <Redirect to="/" />;
	}
}

export default Logout;
