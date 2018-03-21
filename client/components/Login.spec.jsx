
import React from 'react';
import { shallow } from 'enzyme';

import Login from './Login';

import { getAuthToken } from './authentication/token';
import strings from '../../shared/strings';

describe('Login', () => {
	it('should match snapshot', () => {
		const wrapper = shallow(<Login signIn={() => {}} />);
		expect(wrapper).toMatchSnapshot();
	});
	describe('_signIn', () => {
		const username = 'teste';
		const password = 'super-secret';
		it('should correctly sign in and redirect user', async (done) => {
			const promiseSignIn = Promise.resolve({ data: { signIn: { token: 'token' } } });
			const signIn = jest.fn(() => promiseSignIn);
			window.location.reload = jest.fn();

			const wrapper = shallow(<Login signIn={signIn} />);
			wrapper.setState({ username, password });
			const form = wrapper.find('form');
			form.simulate('submit', { preventDefault: jest.fn() });

			await promiseSignIn;

			expect(signIn).toHaveBeenCalledWith({ variables: { user: username, password } });
			expect(getAuthToken()).toEqual('token');
			expect(window.location.reload).toHaveBeenCalled();
			done();
		});
		it('should setState to error message if failed', async (done) => {
			const throwWrapper = async () => {
				const promiseSignIn = Promise.reject(new Error('error'));
				const signIn = jest.fn(() => promiseSignIn);
				window.location.reload = jest.fn();

				const wrapper = shallow(<Login signIn={signIn} />);
				wrapper.setState({ username, password });
				const form = wrapper.find('form');
				form.simulate('submit', { preventDefault: jest.fn() });

				await promiseSignIn;

				expect(wrapper.state('errorMessage')).toEqual(strings.authenticationError);
				expect(window.localtion.reload).not.toHaveBeenCalled();
			};
			throwWrapper();
			done();
		});
	});
	describe('onChangeField', () => {
		it('should update if input is changed', () => {
			const wrapper = shallow(<Login signIn={jest.fn()} />);
			const userInput = wrapper.find('[type="text"]');
			userInput.simulate('change', { target: { value: 'Hello' } });
			expect(wrapper.state('username')).toEqual('Hello');
		});
	});
});
