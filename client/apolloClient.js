import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

import { API_AUTH_TOKEN } from './components/Login';

const httpLink = createHttpLink({ uri: 'http://localhost:3000/api' });

const middlewareAuthLink = new ApolloLink((operation, forward) => {
	const token = localStorage.getItem(API_AUTH_TOKEN);

	const authorizationHeader = token ? `Bearer ${token}` : null;
	operation.setContext({
		headers: {
			authorization: authorizationHeader
		}
	});

	return forward(operation);
});

const httpLinkWithAuthToken = middlewareAuthLink.concat(httpLink);

const apolloClient = new ApolloClient({
	link: httpLinkWithAuthToken,
	cache: new InMemoryCache()
});

export default apolloClient;
