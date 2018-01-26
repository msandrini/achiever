import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

import { getAuthToken } from './components/authentication/token';

const httpLink = new HttpLink();

const middlewareAuthLink = new ApolloLink((operation, forward) => {
	const token = getAuthToken();

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
