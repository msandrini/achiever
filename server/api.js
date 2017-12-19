const { graphqlExpress } = require('apollo-server-express');
const schema = require('./schema');
const { authenticate } = require('./authentication');

const buildOptions = async (req) => {
	const token = await authenticate(req);

	return {
		context: { token },
		schema
	};
};

module.exports = graphqlExpress(buildOptions);
