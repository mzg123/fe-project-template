'use strict'
const glob = require('glob');
const path = require('path');
const fs = require('fs');
const colors = require('colors');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackBbtCommPlugin = require('./webpack.bbt.comm.plugin');
const BaseConfig = require('./baseConfig');

const projectName = BaseConfig.paths.projectName;// path.basename(path.resolve(__dirname, '../../../'));
const feParentPath = BaseConfig.paths.feParentPath;//path.resolve(__dirname, '../../../../../');

const jsDistPath = path.resolve(feParentPath, './static/fe/'+projectName+'/dist/');
const phpDistPath = path.resolve(feParentPath, './tmpl/fe/'+projectName+'/dist/pages/');
const htmlDistPath = path.resolve(feParentPath, './static/fe/'+projectName+'/dist/pages/');
const phpCommDistPath = path.resolve(feParentPath, './tmpl/fe/'+projectName+'/dist/');
const phpControllerRoot = BaseConfig.paths.phpControllerRoot;//'$Preg_FE_base_path.';
const phpStaticPre = '/fe_static';
const nodeArgs = JSON.parse(process.env.npm_config_argv);
const extname = BaseConfig.cli.extname;//isHtml > -1 ? '.html' : '.php';
function log(msg) {

    if (nodeArgs.original[2] && nodeArgs.original[2] == '--debug') {
        console.log(msg.inverse);
    }
}
// 获取指定路径下的入口文件
function getEntries(globPath) {
  const files = glob.sync(globPath),
      entries = {};
  log('find files:' + JSON.stringify(files));
  files.forEach(function(filepath) {
    const extname = path.extname(filepath);
    if (['.html', '.php'].indexOf(extname) > -1) {
        filepath = filepath.substring(filepath.lastIndexOf('src'));      
        const name = filepath.replace('src/', '').replace('pages/', '').replace('.js', '').replace(extname, '');
        //默认加载js
        let jsP = feParentPath + '/fe/' + projectName + '/' + filepath.replace(extname, '.jsx');
        if (fs.existsSync(jsP.replace(path.extname(jsP), '.js'))) {
            jsP = jsP.replace(path.extname(jsP), '.js');
        }
        entries[name + extname] = {
          pagePath: filepath,
          jsName: 'pages/' + name.replace('_cn', '').replace('_en', '').replace('_hk', ''),
          //jsPath: feParentPath + '/fe/' + projectName + '/' + filepath.replace(extname, '.js'),
          jsPath: jsP,
        };
    }
  });

  return entries;
}

//设置 HtmlWebpackPlugin
function handlePhpTemplate(webpackConfig) {
    log('handing Template');
    const indexHtmls = getEntries(path.resolve(feParentPath, './fe/' + projectName + '/src/pages/**/*.*'));
    Object.keys(indexHtmls).forEach(function(name) {
      const isExist = fs.existsSync(indexHtmls[name].jsPath);
      if (isExist) {
          webpackConfig.entry[indexHtmls[name].jsName] = indexHtmls[name].jsPath;
      }
      const extname = path.extname(indexHtmls[name].pagePath);
      let chunks = [indexHtmls[name].jsName];
      if (extname == '.html') {
          chunks = ['lib/lib', 'comm/commJs','comm/commCss', indexHtmls[name].jsName];         
      }
      const plugin = new HtmlWebpackPlugin({
        filename:  (extname == '.html' ? htmlDistPath : phpDistPath) + '/' + name,
        template: indexHtmls[name].pagePath,
        inject: isExist,
        chunks: chunks,
        chunksSortMode: 'manual',
      });
      webpackConfig.plugins.push(plugin);
    });
}

//comp 复制到dist中
function copyCompToDist(webpackConfig) {
    log('copy comp to dist');
    const commHtmls = getEntries(path.resolve(feParentPath, './fe/' + projectName + '/src/comp/**/*.php'));
    Object.keys(commHtmls).forEach(function(name) {
      const plugin = new HtmlWebpackPlugin({
        filename:  phpCommDistPath + '/' + name,
        template: commHtmls[name].pagePath,
        inject: false,
      });
      webpackConfig.plugins.push(plugin);
    });
}

// commJs.php
function handleCommJs(webpackConfig) {
    log('handle commJs.php');
    webpackConfig.plugins.push(new HtmlWebpackPlugin({
      filename:  path.resolve(phpCommDistPath, './comm/commJs.php'),
      template: path.resolve(feParentPath, './fe/' + projectName + '/src/config/comm/commJs.php'),
      inject: true,
      chunks: ['lib/lib', 'comm/commJs'],
      chunksSortMode: 'manual'
    }));
}

// commCss.php
function handleCommCss(webpackConfig) {
    log('handle commCss.php');
    webpackConfig.plugins.push(new HtmlWebpackPlugin({
      filename:  path.resolve(phpCommDistPath, './comm/commCss.php'),
      template: path.resolve(feParentPath, './fe/' + projectName + '/src/config/comm/commCss.php'),
      inject: true,
      chunks: ['comm/commCss'],
      chunksSortMode: 'manual'
    }));
}

//处理自定义
function handleInsertCustomPhp(webpackConfig) {
    log('handle insert custorm php');
    //const jsHtmlPath = path.resolve(feParentPath, './tmpl/fe/' + projectName + '/dist/comm/commJs.php');
    //const cssHtmlPath = path.resolve(feParentPath, './tmpl/fe/' + projectName + '/dist/comm/commCss.php');
    //const cssHtmlPath = '../../../tmpl/fe/' + projectName + '/dist/comm/commCss.php';
    webpackConfig.plugins.push(new WebpackBbtCommPlugin({
      // 删除多产生的js文件引入
      pre: 'commCss',
      exclude: ['js'],

      // 插入comm层的模板文件
      injectExclude: ['commCss', 'commJs'],
      commCssName: 'commCss',//处理掉commCss的<head>标签
      //commJsTpl: (extname === '.php' ? ['<?php include(' + phpControllerRoot + '"tmpl/fe/' + projectName + '/dist/comm/commJs.php");?>'] : jsHtmlPath),
      //commCssTpl: (extname === '.php' ? ['<?php include(' + phpControllerRoot + '"tmpl/fe/' + projectName + '/dist/comm/commCss.php");?>'] : cssHtmlPath),
      commJsTpl: ['tmpl/fe/' + projectName + '/dist/comm/commJs.php'],
      commCssTpl:['tmpl/fe/' + projectName + '/dist/comm/commCss.php'],
    }));
}


function webpackHandleBuild(webpackConfig) {
    handlePhpTemplate(webpackConfig);
    copyCompToDist(webpackConfig);
    handleCommJs(webpackConfig);
    handleCommCss(webpackConfig);
    handleInsertCustomPhp(webpackConfig);
}
module.exports = webpackHandleBuild;
