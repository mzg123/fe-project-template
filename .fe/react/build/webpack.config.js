const webpack = require('webpack');
const glob = require('glob');
const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const WebpackMd5Hash = require('webpack-md5-hash');
const WebpackConfigHandle = require('./webpack.config.handle');
const BaseConfig = require('./baseConfig');
const execNpm = require('./webpackConfig/execNpmEnv/execNpmEnv');

const projectName = BaseConfig.paths.projectName;// path.basename(path.resolve(__dirname, '../../../'));
const feParentPath = BaseConfig.paths.feParentPath;//path.resolve(__dirname, '../../../../../');

const jsDistPath = path.resolve(feParentPath, './static/fe/'+projectName+'/dist/');
const jsWatchPath = path.resolve(feParentPath, './static/fe/'+projectName+'/watch/');
const phpDistPath = path.resolve(feParentPath, './tmpl/fe/'+projectName+'/dist/pages/');
const phpCommDistPath = path.resolve(feParentPath, './tmpl/fe/'+projectName+'/dist/');
const phpControllerRoot = '$Preg_FE_base_path.';
const phpStaticPre = BaseConfig.paths.phpStaticPre;//'/fe_static';

const webpackConfig = {
  entry: {
    'lib/lib': [path.resolve(feParentPath, './fe/' + projectName + '/src/config/lib/lib.js')],
    'comm/commJs': [path.resolve(feParentPath, './fe/' + projectName + '/src/config/comm/commJs.js')],
    'comm/commCss': [path.resolve(feParentPath, './fe/' + projectName + '/src/config/comm/commCss.js')],
  },
  output:{
    path:jsDistPath,
    filename:'[name].[chunkhash:8].js',
    publicPath: path.join(phpStaticPre, '/static/fe/'+projectName+'/dist/')
  },
  resolve: {
      extensions: ['.js', '.json', '.jsx'],
  },
   devServer: {
     inline: true,
     //contentBase: "../../",
     //publicPath: '/',
     publicPath: path.join(phpStaticPre, '/static/fe/'+projectName+'/dist/'),
     port: 8281,
     open: true,
     proxy: {
         "/activity_square": {
          target: 'http://open-miaozhigao.babytree-dev.com',
          changeOrigin: true,
          secure: false
     },
   },
  },
  module:{
    rules:[
      {
        //test:/\.js?$/,
        test:/\.(js|jsx)$/,
        exclude:/node_modules/,
        loader:'babel-loader',
        query:{
          plugins:['transform-runtime'],
          presets:['env', 'react']
          //presets:['es2015', 'babel-preset-env', 'react']
        }
      },
      {
        //test: /\.js$/,
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
        options: {
            configFile: path.resolve(__dirname, './.eslintrc'), 
            failOnWarning: false,
            failOnError: true,        
        }
      },
      {
        test: /\.(scss|sass|css)$/, 
        loader: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: [
            {
              loader: 'css-loader',
              options: {
                minimize: true,
              }
            },
            "sass-loader", // compiles Sass to CSS
            "postcss-loader",
          ]
        })
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loader: 'url-loader',
        options: {
          limit:10000,
          outputPath: 'imgs/'
        }
      },
      {
           test: /\.(php|html)$/i,
           loader: 'html-withimg-loader'
      }
    ]
  },
  plugins: [
    new WebpackMd5Hash(),
    //new ExtractTextPlugin("[name].[contenthash:8].css"),
   // new CleanWebpackPlugin(
   //   [jsDistPath, phpDistPath],　 
   //   {
   //     root: path.resolve(feParentPath),    　　　　　　　　　　
   //     verbose: false,    　　　　　　　　　　
   //     dry:   false    　　　　　　　　　　

   //   }
   // ),
    new webpack.optimize.CommonsChunkPlugin({
      names: ["comm/commJs","lib/lib"],
    }),
  ],

  devtool: 'cheap-module-source-map',
};
execNpm({
    webpackConfig: webpackConfig,
    jsDistPath: jsDistPath,
    jsWatchPath: jsWatchPath,
    phpDistPath: phpDistPath,
    feParentPath: feParentPath,
});

WebpackConfigHandle(webpackConfig);

 
module.exports = webpackConfig;
