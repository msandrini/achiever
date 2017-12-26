import React from 'react';
import PropTypes from 'prop-types';

import * as history from './router/history';
import PAGES from './router/pages';
import PageNotFound from './PageNotFound';

// Router

export default class ShowComponentOnRoute extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			path: props.path
		};
	}

	componentDidMount() {
		history.onChangeLocation((path) => {
			this.setState({ path });
		});
	}

	render() {
		const Component = PAGES[this.state.path] || PageNotFound;
		return <Component />;
	}
}

ShowComponentOnRoute.propTypes = {
	path: PropTypes.string.isRequired
};
