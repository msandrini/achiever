require('dotenv').config();

const HEADER_REGEX = /bearer (.*)$/;

exports.authenticate = async ({ headers: { authorization } }) => {
	if (!authorization || !HEADER_REGEX.exec(authorization)) {
		throw new Error('Request not authorized!!!');
	}

	const token = HEADER_REGEX.exec(authorization)[1];

	return token;
};
