const path = require('path');
const merge = require('webpack-merge');
const webpack = require('webpack');

const common = require('./webpack.common.js');

const appPath = dir => path.resolve(__dirname, dir);

module.exports = merge(common, {
	devtool: 'cheap-module-eval-source-map',
	plugins: [
		new webpack.NamedModulesPlugin(),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoEmitOnErrorsPlugin()
	],
	output: {
		filename: '[name].bundle.js'
	}
});
