const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

function execWithEnv(opt) {
    if (JSON.parse(process.env.npm_config_argv).original.join(' ').trim()
        === 'run build') {
      opt.webpackConfig.plugins.push(
        new CleanWebpackPlugin(
          [opt.jsDistPath, opt.jsWatchPath, opt.phpDistPath],　 
          {
            root: path.resolve(opt.feParentPath),    　　　　　　　　　　
            verbose: false,    　　　　　　　　　　
            dry:   false    　　　　　　　　　　
          }
        )
      );
      opt.webpackConfig.plugins.push(new ExtractTextPlugin("[name].[contenthash:8].css"));
      opt.webpackConfig.plugins.push(new webpack.DefinePlugin({'process.env': {NODE_ENV: JSON.stringify("production"),} }));
      opt.webpackConfig.plugins.push(new webpack.optimize.UglifyJsPlugin({
        minimize: true,
        //compress: false,
      }));
    } else if (JSON.parse(process.env.npm_config_argv).original.join(' ').trim()
        === 'run start' || JSON.parse(process.env.npm_config_argv).original.join(' ').trim() === 'start') {
      opt.webpackConfig.plugins.push(new ExtractTextPlugin("[name].css"));
      opt.webpackConfig.output.filename = '[name].js';
    } else if (JSON.parse(process.env.npm_config_argv).original.join(' ').trim() === 'run watch') {
      opt.webpackConfig.plugins.push(
        new CleanWebpackPlugin(
          [opt.jsWatchPath, opt.phpDistPath],　 
          {
            root: path.resolve(opt.feParentPath),    　　　　　　　　　　
            verbose: false,    　　　　　　　　　　
            dry:   false    　　　　　　　　　　
          }
        )
      );
        opt.webpackConfig.output.publicPath = opt.webpackConfig.output.publicPath.replace('dist\/', 'watch\/');
        opt.webpackConfig.output.path = opt.webpackConfig.output.path.replace('dist', 'watch');
        opt.webpackConfig.plugins.push(new ExtractTextPlugin("[name].[contenthash:8].watch.css"));
        opt.webpackConfig.output.filename = '[name].[chunkhash:8].watch.js'; 
    } else {
      opt.webpackConfig.plugins.push(new ExtractTextPlugin("[name].[contenthash:8].css"));
    }
}
module.exports = execWithEnv;
