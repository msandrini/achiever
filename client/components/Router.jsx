import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import DB from 'minimal-indexed-db';

import * as queries from '../queries.graphql';
import * as history from './router/history';
import { routeDefinitions, defaultPages } from './router/pages';
import PageNotFound from './genericPages/PageNotFound';
import PageLoading from './genericPages/PageLoading';
import { getAuthToken, removeAuthToken } from './authentication/token';

const PATH_ROOT = '/';

const _checkAuth = () => Boolean(getAuthToken());

class ShowComponentOnRoute extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			path: props.path,
			authenticated: _checkAuth()
		};

		this.componentToBeRendered = null;
	}

	componentWillMount() {
		history.onChangeLocation((path) => {
			this.setState({ path });
		});

		// Check if data on indexedDB
		// it's never auth if indexedDB table is empty
		DB('entries', 'date')
			.then((db) => {
				db.getAll()
					.then((data) => {
						if (data.length) {
							this.setState({ authenticated: _checkAuth() });
						}
					})
					.catch((e) => {
						console.error('Router db detection error:', e);
					});
			})
			.catch((e) => {
				console.error('Check db error 1', e);
			});
	}

	componentWillReceiveProps(nextProps) {
		const { userDetails, loading, error } = nextProps.userDetailsQuery;
		if (error || (!loading && !userDetails)) {
			removeAuthToken();
			this.setState({ authenticated: false });
		} else {
		// Check if data on indexedDB
		// it's never auth if indexedDB table is empty
			DB('entries', 'date')
				.then((db) => {
					db.getAll()
						.then((data) => {
							if (data.length) {
								this.setState({ authenticated: _checkAuth() });
							}
						})
						.catch((e) => {
							console.error('Router db detection error:', e);
						});
				})
				.catch((e) => {
					console.error('Check db error 1', e);
				});
		}
	}

	componentWillUpdate(nextProps, nextState) {
		const pageDefinition = routeDefinitions[nextState.path];
		if (pageDefinition) {
			// if user is going to a private page...
			if (pageDefinition.private) {
				// ...they have to be authenticated
				if (this.state.authenticated) {
					this.componentToBeRendered = pageDefinition.component;
				} else {
					// ...otherwise we show the fallback public page
					history.push(defaultPages.public);
				}
			} else if (!this.state.authenticated) {
				// if user is going to a public page...
				// ...they must not be authenticated
				this.componentToBeRendered = pageDefinition.component;

			} else {
				// ...otherwise we show the fallback private page
				history.push(defaultPages.private);
			}

		// if root page ("/") is called it should redirect appropriately
		} else if (this.state.path === PATH_ROOT) {
			if (this.state.authenticated) {
				history.push(defaultPages.private);
			} else {
				history.push(defaultPages.public);
			}

		} else {
			this.componentToBeRendered = PageNotFound;
		}
	}

	render() {
		if (this.props.userDetailsQuery.loading) {
			return <PageLoading active={this.props.userDetailsQuery.loading} />;
		}
		const Component = this.componentToBeRendered;
		return Component ? <Component /> : null;
	}
}

ShowComponentOnRoute.propTypes = {
	path: PropTypes.string.isRequired,
	userDetailsQuery: PropTypes.object
};

ShowComponentOnRoute.defaultProps = {
	userDetailsQuery: {}
};

export default graphql(queries.userDetails, { name: 'userDetailsQuery' })(ShowComponentOnRoute);
