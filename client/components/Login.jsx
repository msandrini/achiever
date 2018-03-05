/* global window */

import React from 'react';
import PropTypes from 'prop-types';
import DB from 'minimal-indexed-db';
import { graphql, compose } from 'react-apollo';

import * as queries from '../queries.graphql';
import Panel from './ui/Panel';
import strings from '../../shared/strings';
import { setAuthToken, removeAuthToken } from './authentication/token';
import { dismemberTimeString } from '../utils';

import apolloClient from '../apolloClient';

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
			if (response) {
				this.setState({ errorMessage: '' });
				const { token } = response.data.signIn;
				setAuthToken(token);

				// Fetch allData from server and insert it @ indexedDB
				const allEntriesQuery = await apolloClient.query({
					query: queries.allEntries
				});
				const timeData = [];
				allEntriesQuery.data.allEntries.timeData.forEach((timeEntry) => {
					timeData.push({
						...timeEntry,
						startTime: dismemberTimeString(timeEntry.startTime),
						breakStartTime: dismemberTimeString(timeEntry.breakStartTime),
						breakEndTime: dismemberTimeString(timeEntry.breakEndTime),
						endTime: dismemberTimeString(timeEntry.endTime),
						persisted: true
					});
				});
				// Propagate the date to indexedDB
				const db = await DB('entries', 'date');
				await db.put(timeData);
				window.location.reload();
			}
		} catch (error) {
			console.log(response, error);
			this.setState({ errorMessage: strings.authenticationError });
			removeAuthToken();
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

export default compose(
	graphql(queries.signIn, { name: 'signIn' }),
)(Login);

Login.propTypes = {
	signIn: PropTypes.func.isRequired
};
