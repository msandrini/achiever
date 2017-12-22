import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import strings from '../../shared/strings';
import { API_AUTH_TOKEN } from './Login';
import '../styles/userDetails.styl';

const USER_DETAILS_QUERY = gql`
	query userDetails {
		userDetails {
			name
			dailyContractedHours
			balance
		}
	}
`;

class UserDetails extends Component {
	constructor(props) {
		super(props);

		this._logout = this._logout.bind(this);

		const token = localStorage.getItem(API_AUTH_TOKEN);
		const loggedIn = Boolean(token);

		this.state = {
			loggedIn
		};
	}

	componentWillReceiveProps(nextProps) {
		const { userDetails, loading, error } = nextProps.userDetailsQuery;

		if (error || (!loading && !userDetails)) {
			localStorage.removeItem(API_AUTH_TOKEN);
			this.setState({ loggedIn: false });
		} else {
			const token = localStorage.getItem(API_AUTH_TOKEN);
			const loggedIn = Boolean(token);
			this.setState({ loggedIn });
		}
	}

	_logout(event) {
		event.preventDefault();
		/* eslint no-alert: "off" */
		const shouldLogout = window.confirm(strings.logoutConfirm);
		if (shouldLogout) {
			localStorage.removeItem(API_AUTH_TOKEN);
			this.setState({ loggedIn: false });
		}
	}

	render() {
		const { loggedIn } = this.state;

		if (loggedIn && !this.props.userDetailsQuery.loading) {
			const { userDetails: { name } } = this.props.userDetailsQuery;

			return (
				<div className="userDetails">
					<div className="employeeName">
						{ name }
					</div>
					<button className="logout" onClick={this._logout}>
						{strings.logout}
					</button>
				</div>
			);
		}
		return (
			<div className="userDetails">
				<nav className="unlogged">
					<NavLink to="/login" activeClassName="is-active">
						{strings.login}
					</NavLink>
				</nav>
			</div>
		);
	}
}

export default graphql(USER_DETAILS_QUERY, { name: 'userDetailsQuery' })(UserDetails);

UserDetails.propTypes = {
	userDetailsQuery: PropTypes.object.isRequired
};
