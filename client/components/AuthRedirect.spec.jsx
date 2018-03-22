// import React from 'react';
// import { shallow, mount } from 'enzyme';

// import AuthRedirect from './AuthRedirect';

// import * as token from './authentication/token';

// const defaultUserDetailsQuery = {
// 	loading: false,
// 	userDetails: {
// 		name: 'JOHN DOE',
// 		dailyContractedHours: '8:00',
// 		lastFridayBalance: ' 2:20',
// 		__typename: 'UserDetails'
// 	},
// 	error: false
// };

describe('Router', () => {
	describe('render', () => {
		// it('should render page loagind if loading', () => {
		// 	const loadingUserDetailsQuery = { ...defaultUserDetailsQuery, loading: true };
		// 	const wrapper = mount(<Router
		// 		path="/"
		// 		userDetailsQuery={loadingUserDetailsQuery}
		// 	/>);
		// 	expect(wrapper).toMatchSnapshot();
		// 	wrapper.unmount();
		// });
		// it('should load the componentToBeRendered if not loading', () => {
		// 	// For this test, it will render PageNotFound
		// 	const wrapper = mount(<Router
		// 		path="/blabla"
		// 		userDetailsQuery={defaultUserDetailsQuery}
		// 	/>);
		// 	wrapper.setState({ path: '/notfound-blablabla' });
		// 	expect(wrapper).toMatchSnapshot();
		// 	wrapper.unmount();
		// });
	});
	describe('componentWillUpdate', () => {
		// pages.routeDefinitions = mockRouteDefinitions;
		// pages.defaultPages = mockRouteDefaultPages;
		// describe(', if user is authenticated,', () => {
		// 	let wrapper;
		// 	beforeEach(() => {
		// 		token.getAuthToken = jest.fn(() => ('loged-in!!'));
		// 		wrapper = shallow(<Router path="/" userDetailsQuery={defaultUserDetailsQuery} />);
		// 	});

		// 	it('should render the private component if logged in', () => {
		// 		wrapper.setState({ path: '/private' });
		// 		expect(wrapper.instance().componentToBeRendered).toEqual(MockPrivateTestComponent);
		// 	});
		// });
		// describe(', if user is not authenticated,', () => {
		// 	let wrapper;
		// 	beforeEach(() => {
		// 		token.getAuthToken = jest.fn(() => (null));
		// 		wrapper = shallow(<Router path="/" userDetailsQuery={defaultUserDetailsQuery} />);
		// 	});
		// 	it('should render the private component if logged in', () => {
		// 		wrapper.setState({ path: '/public' });
		// 		expect(wrapper.instance().componentToBeRendered).toEqual(MockPublicTestComponent);
		// 	});
		// });
	});
	describe('componentWillReceiveProps', () => {
		//
	});
});
