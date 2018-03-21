const config = {
	name: 'achiever',
	script: 'server/index.js',
	env: {
		NODE_PATH: '.'
	}
};

if (process.env.NODE_ENV !== 'development') {
	Object.assign(config, {
		watch: ['server']
	});
}

module.exports = config;
