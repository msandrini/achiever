const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const appPath = dir => path.resolve(__dirname, dir);

module.exports = {
	entry: {
		app: ['babel-polyfill', appPath('client/index.jsx')]
	},
	output: {
		path: appPath('client/dist'),
		publicPath: '/'
	},
	module: {
		rules: [
			{
				test: /.jsx?$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
				query: {
					presets: ['env', 'react']
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
	plugins: [
		new CleanWebpackPlugin([appPath('client/dist')]),
		new HtmlWebpackPlugin({
			title: 'Achiever',
			template: appPath('client/public/index.html')
		}),
		new webpack.optimize.CommonsChunkPlugin({
			name: 'vendor',
			minChunks(module) {
				return module.context && module.context.includes('node_modules');
			}
		}),
		new webpack.optimize.CommonsChunkPlugin({
			name: 'manifest',
			minChunks: Infinity
		})
	],
	resolve: {
		extensions: ['.js', '.jsx']
	}
};
