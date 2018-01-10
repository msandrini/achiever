import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import Link from '../router/Link';

import strings from '../../../shared/strings';
import { getAuthToken, removeAuthToken } from './token';
import '../../styles/userDetails.styl';

const USER_DETAILS_QUERY = gql`
	query userDetails {
		userDetails {
			name
			dailyContractedHours
			balance
		}
	}
`;

const _logout = (event) => {
	event.preventDefault();
	removeAuthToken();
	window.location.reload();
};

class UserDetails extends Component {
	constructor(props) {
		super(props);

		this.state = {
			authenticated: false
		};
	}

	componentWillReceiveProps(nextProps) {
		const { userDetails, loading, error } = nextProps.userDetailsQuery;

		if (error || (!loading && !userDetails)) {
			removeAuthToken();
			this.setState({ authenticated: false });
		} else {
			const token = getAuthToken();
			const authenticated = Boolean(token && userDetails.name);
			this.setState({ authenticated });
		}
	}

	render() {
		const { userDetails, loading, error } = this.props.userDetailsQuery;

		if (loading) {
			return <div>Loading...</div>;
		}

		const { authenticated } = this.state;

		if (authenticated && !error) {
			const [firstName] = userDetails.name.split(' ');

			return (
				<div className="userDetails">
					<div className="employeeName">
						{`${strings.helloName} ${firstName}`}
					</div>
					<button className="logout" onClick={_logout}>
						{strings.logout}
					</button>
				</div>
			);
		}
		return (
			<div className="userDetails">
				<Link to="/login" activeClassName="is-active">
					{strings.login}
				</Link>
			</div>
		);
	}
}

export default graphql(USER_DETAILS_QUERY, { name: 'userDetailsQuery' })(UserDetails);

UserDetails.propTypes = {
	userDetailsQuery: PropTypes.object.isRequired
};
