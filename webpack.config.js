const path = require('path');

const appPath = dir => path.resolve(__dirname, dir);

module.exports = {
	entry: appPath('client/index.jsx'),
	output: {
		path: appPath('client/dist'),
		filename: 'app.js'
	},
	module: {
		rules: [
			{
				test: /.jsx?$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
				query: {
					presets: ['es2015', 'react']
				}
			},
			{
				test: /\.css$/,
				use: [
					{ loader: 'style-loader' },
					{ loader: 'css-loader' }
				]
			},
			{
				test: /\.styl$/,
				use: [
					{ loader: 'style-loader' },
					{ loader: 'css-loader' },
					{ loader: 'stylus-loader' }
				]
			},
			{
				test: /\.(graphql|gql)$/,
				exclude: /node_modules/,
				loader: 'graphql-tag/loader'
			}
		]
	},
	resolve: {
		extensions: ['.js', '.jsx']
	}
};
