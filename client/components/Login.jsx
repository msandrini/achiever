/* global window */

import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import * as queries from '../queries.graphql';
import AlertModal from './ui/modals/AlertModal';
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

	onCloseAlert() {
		return () => {
			this.setState({ errorMessage: '' });
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
		const response = await this.props.signIn({
			variables: {
				user: username,
				password
			}
		});

		if (response) {
			if (response.errors && response.errors.length) {
				this.setState({ errorMessage: response.errors[0].message });
			} else {
				this.setState({ errorMessage: '' });
				const { token } = response.data.signIn;
				setAuthToken(token);
				window.location.reload();
			}
		}
	}

	render() {
		return (
			<React.Fragment>
				<div className="column column-nav" />
				<div className="column column-actions">
					<h2 className="current-date">
						<strong>{strings.login}</strong>
					</h2>
					<main>
						<AlertModal
							title={strings.error}
							active={Boolean(this.state.errorMessage)}
							content={this.state.errorMessage}
							onClose={this.onCloseAlert}
						/>
						<form onSubmit={this.onSubmit} className="login-form">
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
						</form>
					</main>
				</div>
			</React.Fragment>
		);
	}
}

export default graphql(queries.signIn, { name: 'signIn' })(Login);

Login.propTypes = {
	signIn: PropTypes.func.isRequired
};
