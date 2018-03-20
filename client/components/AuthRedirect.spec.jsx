import React from 'react';
import { shallow, mount } from 'enzyme';

import Router from './Router';

import * as pages from './router/pages';
import * as token from './authentication/token';
import * as history from './router/history';


const defaultUserDetailsQuery = {
	loading: false,
	userDetails: {
		name: 'JOHN DOE',
		dailyContractedHours: '8:00',
		lastFridayBalance: ' 2:20',
		__typename: 'UserDetails'
	},
	error: false
};

// eslint-disable react/prop-types
const MockPublicTestComponent = jest.fn(({ myProps }) => (
	<div>
		{ myProps || null }
	</div>
));
const MockPrivateTestComponent = jest.fn(({ myProps }) => (
	<div>
		{ myProps || null }
	</div>
));

const mockRouteDefinitions = {
	'/public': { component: MockPublicTestComponent, name: 'pub', private: false },
	'/private': { component: MockPrivateTestComponent, name: 'pri', private: true }
};

const mockRouteDefaultPages = {
	public: '/public',
	private: '/private'
};


describe('Router', () => {
	describe('render', () => {
		it('should render page loagind if loading', () => {
			const loadingUserDetailsQuery = { ...defaultUserDetailsQuery, loading: true };
			const wrapper = mount(<Router
				path="/"
				userDetailsQuery={loadingUserDetailsQuery}
			/>);
			expect(wrapper).toMatchSnapshot();
			wrapper.unmount();
		});
		it('should load the componentToBeRendered if not loading', () => {
			// For this test, it will render PageNotFound
			const wrapper = mount(<Router
				path="/blabla"
				userDetailsQuery={defaultUserDetailsQuery}
			/>);
			wrapper.setState({ path: '/notfound-blablabla' });
			expect(wrapper).toMatchSnapshot();
			wrapper.unmount();
		});
	});
	describe('componentWillUpdate', () => {
		pages.routeDefinitions = mockRouteDefinitions;
		pages.defaultPages = mockRouteDefaultPages;
		describe(', if user is authenticated,', () => {
			let wrapper;
			beforeEach(() => {
				token.getAuthToken = jest.fn(() => ('loged-in!!'));
				wrapper = shallow(<Router path="/" userDetailsQuery={defaultUserDetailsQuery} />);
			});

			it('should render the private component if logged in', () => {
				wrapper.setState({ path: '/private' });
				expect(wrapper.instance().componentToBeRendered).toEqual(MockPrivateTestComponent);
			});
			it('should redirect to default private page if accessing public route', () => {
				history.push = jest.fn();
				wrapper.setState({ path: '/public' });
				expect(history.push).toHaveBeenCalledWith(pages.defaultPages.private);
			});
			it('should redirect to default private page if root path (/)', () => {
				history.push = jest.fn();
				wrapper.setState({ path: '/' });
				expect(history.push).toHaveBeenCalledWith(pages.defaultPages.private);
			});
		});
		describe(', if user is not authenticated,', () => {
			let wrapper;
			beforeEach(() => {
				token.getAuthToken = jest.fn(() => (null));
				wrapper = shallow(<Router path="/" userDetailsQuery={defaultUserDetailsQuery} />);
			});
			it('should render the private component if logged in', () => {
				wrapper.setState({ path: '/public' });
				expect(wrapper.instance().componentToBeRendered).toEqual(MockPublicTestComponent);
			});
			it('should redirect to default public page if accessing private route', () => {
				history.push = jest.fn();
				wrapper.setState({ path: '/private' });
				expect(history.push).toHaveBeenCalledWith(pages.defaultPages.public);
			});
			it('should redirect to default private page if root path (/)', () => {
				history.push = jest.fn();
				wrapper.setState({ path: '/' });
				expect(history.push).toHaveBeenCalledWith(pages.defaultPages.public);
			});
		});
	});
	describe('componentWillReceiveProps', () => {
		it('should authenticate when props are correct', () => {
			const loadingQuery = { ...defaultUserDetailsQuery, loading: true };
			const wrapper = shallow(<Router path="/" userDetailsQuery={loadingQuery} />);

			token.getAuthToken = jest.fn(() => ('loggedIn'));
			wrapper.setProps({ userDetailsQuery: defaultUserDetailsQuery });

			expect(wrapper.state('authenticated')).toEqual(true);
		});
		it('should authenticate when props are not correct', () => {
			const loadingQuery = { ...defaultUserDetailsQuery, loading: true };
			const wrapper = shallow(<Router path="/" userDetailsQuery={loadingQuery} />);

			const errorQuery = { ...defaultUserDetailsQuery, error: true };
			wrapper.setProps({ userDetailsQuery: errorQuery });

			expect(wrapper.state('authenticated')).toEqual(false);
		});
	});
});
