import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';

import Main from './components/Main';
import apolloClient from './apolloClient';

/* eslint-env browser */

ReactDOM.render(
	<ApolloProvider client={apolloClient}>
		<Main />
	</ApolloProvider>,
	document.getElementById('root'),
);
