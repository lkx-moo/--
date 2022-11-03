const HtmlWebpackPlugin = require('html-webpack-plugin')

// webpack < 5 used to include polyfills for node.js core modules by default
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

const webpack = require('webpack')

const path = require('path')

module.exports = {
    entry: './index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.js'
    },
    resolve: {
        alias: {
           process: "process/browser"
        } 
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: path.resolve(__dirname, './index.html'),
            templateParameters(compilation, assets, options) {
                return {
                compilation: compilation,
                webpack: compilation.getStats().toJson(),
                webpackConfig: compilation.options,
                htmlWebpackPlugin: {
                    files: assets,
                    options: options
                },
                process,
                };
            },
            minify: {
                collapseWhitespace: true,
                removeAttributeQuotes: true,
                removeComments: true
            },
            nodeModules: false
        }),
        //解决process is not defined错误，npm install process --save
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
        new NodePolyfillPlugin()
    ],
    devServer: {
        compress: true,
        port: 9000,
        hot: true,
        open:true,
        
    },
    optimization: {
    	nodeEnv: false
  	},
    mode: 'development'
};