const { graphqlExpress } = require('apollo-server-express');
const schema = require('./schema');

module.exports = graphqlExpress({
	schema
});
