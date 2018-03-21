import React from 'react';
import { shallow } from 'enzyme';

import UserDetails from './UserDetails';

import * as utils from '../../utils';
import * as token from './token';

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

describe('UserDetails', () => {
	describe('render', () => {
		it('should render loading if loading', () => {
			const wrapper = shallow(<UserDetails
				userDetailsQuery={{ ...defaultUserDetailsQuery, loading: true }}
			/>);
			expect(wrapper).toMatchSnapshot();
		});
		it('should render a div for login if not auth', () => {
			const wrapper = shallow(<UserDetails userDetailsQuery={defaultUserDetailsQuery} />);
			expect(wrapper).toMatchSnapshot();
		});
		it('should render a div for login if auth but has error', () => {
			const wrapper = shallow(<UserDetails userDetailsQuery={defaultUserDetailsQuery} />);
			wrapper.setProps({ userDetailsQuery: { ...defaultUserDetailsQuery, error: true } });
			wrapper.setState({ authenticated: true });
			expect(wrapper).toMatchSnapshot();
		});
		it('should render a welcome div if user auth and no errors', () => {
			const wrapper = shallow(<UserDetails userDetailsQuery={defaultUserDetailsQuery} />);
			wrapper.setState({ authenticated: true });
			expect(wrapper).toMatchSnapshot();
		});
	});
	describe('logout', () => {
		it('should be called at logout button', () => {
			utils.clearTodayStorage = jest.fn();		// Will remove infos from user of localStorage
			token.removeAuthToken = jest.fn();			//	^
			window.location.reload = jest.fn();			// Reload window to logout

			const wrapper = shallow(<UserDetails userDetailsQuery={defaultUserDetailsQuery} />);
			wrapper.setState({ authenticated: true });
			const logOutButton = wrapper.find('button');
			logOutButton.simulate('click', { preventDefault: jest.fn() });

			expect(utils.clearTodayStorage).toHaveBeenCalled();
			expect(token.removeAuthToken).toHaveBeenCalled();
			expect(window.location.reload).toHaveBeenCalled();
		});
	});

	describe('componentWillReceiveProps', () => {
		it('should authenticate if receive props', () => {
			token.getAuthToken = jest.fn(() => ('superSecureToken'));

			const loadingUserDetails = { ...defaultUserDetailsQuery, loading: true };
			const wrapper = shallow(<UserDetails userDetailsQuery={loadingUserDetails} />);

			wrapper.setProps({ userDetailsQuery: defaultUserDetailsQuery });

			expect(wrapper.state('authenticated')).toBeTruthy();
		});
	});
});
