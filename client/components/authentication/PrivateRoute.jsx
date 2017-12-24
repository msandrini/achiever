import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect, withRouter } from 'react-router-dom';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import { API_AUTH_TOKEN } from '../Login';

const USER_DETAILS_QUERY = gql`
	query userDetails {
		userDetails {
			name
			dailyContractedHours
			balance
		}
	}
`;

class PrivateRoute extends Component {
	constructor(props) {
		super(props);

		const token = localStorage.getItem(API_AUTH_TOKEN);
		const authenticated = Boolean(token);

		this.state = { authenticated };

		this.renderComponentOrRedirect = this.renderComponentOrRedirect.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		const { userDetails, loading, error } = nextProps.userDetailsQuery;

		if (error || (!loading && !userDetails)) {
			localStorage.removeItem(API_AUTH_TOKEN);
			this.setState({ authenticated: false });
		} else {
			const token = localStorage.getItem(API_AUTH_TOKEN);
			const authenticated = Boolean(token);
			this.setState({ authenticated });
		}
	}

	renderComponentOrRedirect() {
		const { component: WrappedComponent, location } = this.props;

		if (!this.state.authenticated) {
			return (
				<Redirect
					to={{
						pathname: '/login',
						state: { from: location }
					}}
				/>
			);
		}

		return <WrappedComponent {...this.props} />;
	}

	render() {
		const { component, userDetailsQuery, ...rest } = this.props;

		if (userDetailsQuery.loading) {
			return <div>Loading...</div>;
		}

		return <Route {...rest} render={this.renderComponentOrRedirect} />;
	}
}

export default withRouter(graphql(USER_DETAILS_QUERY, { name: 'userDetailsQuery' })(PrivateRoute));

PrivateRoute.propTypes = {
	component: PropTypes.any.isRequired,
	location: PropTypes.object.isRequired,
	userDetailsQuery: PropTypes.object.isRequired
};
