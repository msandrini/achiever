/* global window */

import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import * as queries from '../queries.graphql';
import Panel from './ui/Panel';
import strings from '../../shared/strings';
import { setAuthToken } from './authentication/token';

import './Login.styl';

class Login extends React.Component {
	constructor(props) {
		super(props);

		this.onSubmit = this.onSubmit.bind(this);

		this.state = {
			username: '',
			password: '',
			errorMessage: ''
		};
	}

	onChangeField(field) {
		return (event) => {
			this.setState({ [field]: event.target.value });
		};
	}

	onSubmit(event) {
		event.preventDefault();

		const { username, password } = this.state;

		this._signIn(username, password);
	}

	_shouldSubmitBeAvailable() {
		return this.state.username && this.state.password;
	}

	async _signIn(username, password) {
		let response;
		try {
			response = await this.props.signIn({
				variables: {
					user: username,
					password
				}
			});
		} catch (error) {
			this.setState({ errorMessage: strings.authenticationError });
		}

		if (response) {
			this.setState({ errorMessage: '' });
			const { token } = response.data.signIn;
			setAuthToken(token);
			window.location.reload();
		}
	}

	render() {
		return (
			<div className="page-wrapper">
				<form onSubmit={this.onSubmit}>
					<h2 className="current-date">
						<strong>{strings.login}</strong>
					</h2>
					<div className="columns">
						<div className="column column-half" />
						<div className="column column-half">
							<Panel type="error" message={this.state.errorMessage} />
							<div className="login-field">
								<input
									type="text"
									name="username"
									placeholder={strings.username}
									onChange={this.onChangeField('username')}
								/>
							</div>
							<div className="login-field">
								<input
									type="password"
									name="password"
									placeholder={strings.password}
									onChange={this.onChangeField('password')}
								/>
							</div>
							<button
								type="submit"
								className="send send-login"
								disabled={!this._shouldSubmitBeAvailable()}
							>
								{strings.send}
							</button>
						</div>
					</div>
				</form>
			</div>
		);
	}
}

export default graphql(queries.signIn, { name: 'signIn' })(Login);

Login.propTypes = {
	signIn: PropTypes.func.isRequired
};
