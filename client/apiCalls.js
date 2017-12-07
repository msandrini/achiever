import 'whatwg-fetch';

const apiCalls = {
	send: data => fetch('/times', {
		method: 'post',
		body: data,
		headers: {
			'Content-Type': 'application/json'
		}
	})
};

export default apiCalls;
