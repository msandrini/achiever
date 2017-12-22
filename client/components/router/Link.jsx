import React from 'react';
import PropTypes from 'prop-types';

import * as history from './history';

const Link = (props) => {
	const onClick = (e) => {
		const aNewTab = e.metaKey || e.ctrlKey;
		const anExternalLink = props.href.startsWith('http');

		if (!aNewTab && !anExternalLink) {
			e.preventDefault();
			history.push(props.href);
		}
	};

	return (
		<a href={props.to} className={props.className} onClick={onClick}>
			{props.children}
		</a>
	);
};

Link.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.element,
		PropTypes.string
	]),
	href: PropTypes.string,
	className: PropTypes.string,
	to: PropTypes.string.isRequired
};

Link.defaultProps = {
	children: null,
	className: '',
	href: '#'
};

export default Link;
