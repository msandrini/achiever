import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import * as queries from '../../queries.graphql';
import strings from '../../../shared/strings';
import { getAuthToken, removeAuthToken } from './token';
import { clearTodayStorage } from '../../utils';
import UserOptions from '../userOptions/UserOptions';

import './UserDetails.styl';

const _logout = (event) => {
	event.preventDefault();
	removeAuthToken();
	clearTodayStorage();
	window.location.reload();
};

class UserDetails extends Component {
	constructor(props) {
		super(props);

		this.state = {
			authenticated: false
		};

		this.openMonthlyReport = this.openMonthlyReport.bind(this);
		this.changePassword = this.changePassword.bind(this);
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

	/* eslint-disable class-methods-use-this */

	openMonthlyReport(monthData) {
		console.log({ monthData });
	}

	changePassword(passwordData) {
		console.log({ passwordData });
	}

	/* eslint-enable class-methods-use-this */

	render() {
		const { userDetails, loading, error } = this.props.userDetailsQuery;

		if (loading) {
			return <div>Loading...</div>;
		}

		const { authenticated } = this.state;

		if (authenticated && !error) {
			const [firstName] = userDetails.name.split(' ');

			return (
				<div className="user-details">
					<div className="employee-name">
						{`${strings.helloName} ${firstName}`}
					</div>
					<nav>
						<UserOptions
							reportCall={this.openMonthlyReport}
							passwordCall={this.changePassword}
						/>
						<li>
							<button className="logout" onClick={_logout}>
								{strings.logout}
							</button>
						</li>
					</nav>
				</div>
			);
		}
		return null;
	}
}

export default graphql(queries.userDetails, { name: 'userDetailsQuery' })(UserDetails);

UserDetails.propTypes = {
	userDetailsQuery: PropTypes.object
};

UserDetails.defaultProps = {
	userDetailsQuery: {}
};
