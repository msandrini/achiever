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
		this.state = {
			authenticated: false
		};
	}

	componentWillReceiveProps(nextProps) {
		const { userDetails, loading, error } = nextProps.userDetailsQuery;

		if (error || (!loading && !userDetails)) {
			localStorage.removeItem(API_AUTH_TOKEN);
			this.setState({ authenticated: false });
		} else {
			const token = localStorage.getItem(API_AUTH_TOKEN);
			const authenticated = Boolean(token && userDetails.name);
			this.setState({ authenticated });
		}
	}

	_logout(event) {
		event.preventDefault();
		localStorage.removeItem(API_AUTH_TOKEN);
		this.setState({ authenticated: false });
	}

	render() {
		const { userDetails, loading, error } = this.props.userDetailsQuery;

		if (loading) {
			return <div>Loading...</div>;
		}

		const { authenticated } = this.state;

		if (authenticated && !error) {
			const { name } = userDetails;

			return (
				<div className="userDetails">
					<div className="employeeName">
						{ name }
					</div>
					<NavLink to="/logout" className="logout">
						{strings.logout}
					</NavLink>
				</div>
			);
		}
		return (
			<div className="userDetails">
				<NavLink to="/login" activeClassName="is-active">
					{strings.login}
				</NavLink>
			</div>
		);
	}
}

export default graphql(USER_DETAILS_QUERY, { name: 'userDetailsQuery' })(UserDetails);

UserDetails.propTypes = {
	userDetailsQuery: PropTypes.object.isRequired
};
