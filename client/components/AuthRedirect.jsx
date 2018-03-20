import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import * as queries from '../queries.graphql';
import FullScreenSpinner from './ui/FullScreenSpinner';
import Login from './Login';
import Edit from './Edit';
import { getAuthToken, removeAuthToken } from './authentication/token';

const PATH_ROOT = '/';

const _checkAuth = () => Boolean(getAuthToken());

class AuthRedirect extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			authenticated: null
		};
	}

	componentWillMount() {
		this.setState({ authenticated: _checkAuth() });
	}

	componentWillReceiveProps(nextProps) {
		const { userDetails, loading, error } = nextProps.userDetailsQuery;
		if (error || (!loading && !userDetails)) {
			removeAuthToken();
			this.setState({ authenticated: false });
		} else {
			this.setState({ authenticated: _checkAuth() });
		}
	}

	render() {
		if (this.props.userDetailsQuery.loading) {
			return <FullScreenSpinner active={this.props.userDetailsQuery.loading} />;
		}
		const Component = this.state.authenticated ? Edit : Login;
		return Component ? <Component /> : null;
	}
}

AuthRedirect.propTypes = {
	userDetailsQuery: PropTypes.object
};

AuthRedirect.defaultProps = {
	userDetailsQuery: {}
};

export default graphql(queries.userDetails, { name: 'userDetailsQuery' })(AuthRedirect);
