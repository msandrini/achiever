import React from 'react';

import strings from '../../shared/strings';

import '../styles/login.styl';

export default class Main extends React.Component {
	constructor(props) {
		super(props);

		this.onSubmit = this.onSubmit.bind(this);

		this.state = {
			username: '',
			password: ''
		};
	}

	onSubmit(event) {
		event.preventDefault();

		const paramsToSend = ({
			username: this.state.username,
			password: this.state.password
		});

		console.log(paramsToSend);
	}

	onChangeField(field) {
		return (event) => {
			this.setState({ [field]: event.target.value });
		};
	}

	_shouldSubmitBeAvailable() {
		return this.state.username && this.state.password;
	}

	render() {
		return (
			<div className="page-wrapper">
				<form onSubmit={this.onSubmit}>
					<h2 className="current-date">
						<strong>{strings.login}</strong>
					</h2>
					<div className="column">&nbsp;</div>
					<div className="column">
						<div className="time-management-content">
							<div className="login-field">
								<label htmlFor="username">{strings.username}</label>
								<input
									type="text"
									name="username"
									onChange={this.onChangeField('username')}
								/>
							</div>
							<div className="login-field">
								<label htmlFor="password">{strings.password}</label>
								<input
									type="text"
									name="password"
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
