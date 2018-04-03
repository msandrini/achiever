import React from 'react';
import { shallow } from 'enzyme';

import AuthRedirect from './AuthRedirect';

import * as token from './authentication/token';

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

const shallowComponent = (userDetailsQuery) => {
	const wrapper = shallow(<AuthRedirect
		userDetailsQuery={userDetailsQuery}
		signIn={{}}
		addTimeEntryMutation={() => {}}
		updateTimeEntryMutation={() => {}}
	/>);
	return wrapper;
};

describe('AuthRedirect', () => {
	describe('render', () => {
		it('should render page loading if loading', () => {
			const loadingUserDetailsQuery = { ...defaultUserDetailsQuery, loading: true };
			const wrapper = shallowComponent(loadingUserDetailsQuery);
			expect(wrapper).toMatchSnapshot();
		});
		it('should load TimeEntry if not loading and if authenticated', () => {
			const wrapper = shallowComponent(defaultUserDetailsQuery);
			wrapper.setState({ authenticated: true });
			expect(wrapper).toMatchSnapshot();
		});
		it('should load Login if not loading and not authenticated', () => {
			const wrapper = shallowComponent(defaultUserDetailsQuery);
			wrapper.setState({ authenticated: false });
			expect(wrapper).toMatchSnapshot();
		});
	});
	describe('componentWillReceiveProps', () => {
		it('should authenticate when props are correct', () => {
			const loadingQuery = { ...defaultUserDetailsQuery, loading: true };
			const wrapper = shallowComponent(loadingQuery);

			token.getAuthToken = jest.fn(() => ('loggedIn'));
			wrapper.setProps({ userDetailsQuery: defaultUserDetailsQuery });

			expect(wrapper.state('authenticated')).toEqual(true);
		});
		it('should authenticate when props are not correct', () => {
			const loadingQuery = { ...defaultUserDetailsQuery, loading: true };
			const wrapper = shallowComponent(loadingQuery);

			const errorQuery = { ...defaultUserDetailsQuery, error: true };
			wrapper.setProps({ userDetailsQuery: errorQuery });

			expect(wrapper.state('authenticated')).toEqual(false);
		});
	});
});
