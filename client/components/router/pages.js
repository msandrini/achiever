import Login from '../Login';
import Today from '../Today';
import Edit from '../Edit';

import strings from '../../../shared/strings';

export const routeDefinitions = {
	'/login': { component: Login, name: strings.login, private: false },
	'/today': { component: Today, name: strings.todayPage, private: true },
	'/edit': { component: Edit, name: strings.editPage, private: true }
};

export const defaultPages = {
	public: '/login',
	private: '/today'
};
