import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import Panel from './ui/Panel';
import strings from '../../shared/strings';

import '../styles/login.styl';

const SIGN_IN_MUTATION = gql`
  mutation signIn($user: String!, $password: String!) {
	signIn(user: $user, password: $password) {
	  token
	}
  }
`;

export const API_AUTH_TOKEN = 'achiever-auth-token';

class Login extends React.Component {
	constructor(props) {
		super(props);

		this.onSubmit = this.onSubmit.bind(this);

		this.state = {
			username: '',
			password: '',
			errorMessage: '',
			redirectToReferrer: false
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
			localStorage.setItem(API_AUTH_TOKEN, token);
			this.setState({ redirectToReferrer: true });
		}
	}

	render() {
		const { from } = this.props.location.state || {
			from: { pathname: '/' }
		};
		const { redirectToReferrer } = this.state;

		if (redirectToReferrer) {
			return <Redirect to={from} />;
		}

		return (
			<div className="page-wrapper">
				<form onSubmit={this.onSubmit}>
					<h2 className="current-date">
						<strong>{strings.login}</strong>
					</h2>
					<div className="column">&nbsp;</div>
					<div className="column">
						<div className="login-content">
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
								className="send"
								ref={(button) => { this.submitButton = button; }}
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

export default graphql(SIGN_IN_MUTATION, { name: 'signIn' })(Login);

Login.propTypes = {
	signIn: PropTypes.func.isRequired,
	location: PropTypes.object.isRequired
};
