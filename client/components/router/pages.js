import Login from '../Login';
import Today from '../Today';
import Edit from '../Edit';

export const routeDefinitions = {
	'/login': { component: Login },
	'/today': { component: Today, private: true },
	'/edit': { component: Edit, private: true }
};

export const defaultPages = {
	public: '/login',
	private: '/today'
};
