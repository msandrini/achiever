/* eslint-disable import/no-extraneous-dependencies */
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import * as Apollo from 'react-apollo'; // eslint-disable-line no-unused-vars

jest.mock('react-apollo', () => ({
	graphql: () => jest.fn(component => component),
	compose: () => jest.fn(component => component)
}));

configure({ adapter: new Adapter() });
