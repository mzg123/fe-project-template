"use strict";
const Path = require('path');
const fs = require('fs');
const BaseConfig = require('./baseConfig');
const map = {};
const extname = BaseConfig.cli.extname;//isHtml > -1 ? '.html' : '.php';
const phpControllerRoot = BaseConfig.paths.phpControllerRoot;
const feParentPath = BaseConfig.paths.feParentPath;

function HtmlWebpackCustomPlugin(options){
    this.options = options;
    //pre 文件名（不包括hash部分）对php模版注入的资源进行过滤 结合exclude值
    //exclude 排除那类资源 目前包括 js css 数组形式

    //injectExclude: ['comm_css_tpl', 'comm_js_tpl'], 对php模版注入另外的php模版 结合commJsTpl commCssTpl
    //commJsTpl: ['<?php include("fe/Engineering/tmpl/fe/dist/comm_js/comm_js_tpl.php");?>'], 要注入的commJsTpl的PHP模版
    //commCssTpl: ['<?php include("fe/Engineering/tmpl/fe/dist/comm_js/comm_css_tpl.php");?>'],要注入的commCssTpl的PHP模版
}
function handleInsert(htmlPluginData, commCssTpl, commJsTpl) {
    let cssReg = /(<link)([\s+href=\".+\"\s+rel=\"stylesheet\"\s*>|\s+rel=\"stylesheet\"\s+href=\".+\"\s*>])/;
    if (cssReg.test(htmlPluginData.html)) {//包含link 引用css 放在link前
        htmlPluginData.html = htmlPluginData.html.replace(/(<link)([\s+href=\".+\"\s+rel=\"stylesheet\"\s*>|\s+rel=\"stylesheet\"\s+href=\".+\"\s*>])/, commCssTpl.join('') + '$1$2');
    } else if (htmlPluginData.html.indexOf('</head>') > -1) {//包含</head>标签放在</head>前
        htmlPluginData.html = htmlPluginData.html.replace(/\<\/head\>/, function(reg){
            return commCssTpl.join('') + reg;
        });
    } else if (htmlPluginData.html.indexOf('<body>') > -1) {//包含 <body>放在<body>前
        htmlPluginData.html = htmlPluginData.html.replace(/\<body\>/, function(reg){
            return commCssTpl.join('') + reg;
        });
    } else if (htmlPluginData.html.indexOf('<meta') > -1) {//包含<meta>放在最后一个meta后
        //此种模式node中不起作用 htmlPluginData.html = htmlPluginData.html.replace(/(.*)(<meta[^<]*>)/, '$1$2' + commCssTpl.join(''));
        let matchs = htmlPluginData.html.match(/<meta[^<]*>/g);
        let r = matchs[matchs.length - 1];
        htmlPluginData.html = htmlPluginData.html.replace(r, r + commCssTpl.join(''));
    } else if (htmlPluginData.html.indexOf('<html>') > -1) {//包含<html>放在<html>后
        htmlPluginData.html = htmlPluginData.html.replace(/\<html\>/, function(reg){
            return reg + commCssTpl.join('');
        });
    } else {//其它 放在最前边
        htmlPluginData.html = commCssTpl.join('') + htmlPluginData.html;
    }

    let jsReg = /(<script)([\s+src=\".+\"\s+type=\"text/javascript\"\s*></script>|\s+type=\"text/javascript\"\s+src=\".+\"\s*></script>])/;
    if (jsReg.test(htmlPluginData.html)) {
        htmlPluginData.html = htmlPluginData.html.replace(/(<script)([\s+src=\".+\"\s+type=\"text/javascript\"\s*></script>|\s+type=\"text/javascript\"\s+src=\".+\"\s*></script>])/, commJsTpl.join('') + '$1$2');
    } else if(htmlPluginData.html.indexOf('</body>') > -1) {//包含 </body>放在</body>后
        htmlPluginData.html = htmlPluginData.html.replace(/\<\/body\>/, function(reg){
            return reg + commJsTpl.join('');
        });
    } else if(htmlPluginData.html.indexOf('</html>') > -1) {//包含 </html>放在</html>前
        htmlPluginData.html = htmlPluginData.html.replace(/\<\/html\>/, function(reg){
            return commJsTpl.join('') + reg;
        });
    } else { //其它情况放在最后
        htmlPluginData.html = htmlPluginData.html + commJsTpl.join('');
    }
}
HtmlWebpackCustomPlugin.prototype.apply = function(compiler){
    const pre = this.options.pre;
    const exclude = this.options.exclude || [];
    const injectExclude = this.options.injectExclude || [];
    let commJsTpl = this.options.commJsTpl || [];
    let commCssTpl = this.options.commCssTpl || [];
    const commCssName = this.options.commCssName;
    compiler.plugin('compilation', function(compilation){
        compilation.plugin('html-webpack-plugin-before-html-processing', function(htmlPluginData, callback){
            const assets = htmlPluginData.assets;
            for(const outputUrl of assets.js) {
                const outputName = Path.basename(outputUrl, '.js');
                if (outputName.indexOf(pre) > -1) {
                    map[outputName] = outputUrl;
                    if (exclude.indexOf('js') > -1) {
                        assets.js = assets.js.filter(function(item) {
                            return item != outputUrl;        
                        });
                    }
                    if (exclude.indexOf('css') > -1) {
                        assets.css = [];
                    }
                }
            }
            callback(null, htmlPluginData);        
        });
        //处理注入comm_css_tpl.php comm_js_tpl.php 放到页面css js之前
        compilation.plugin('html-webpack-plugin-after-html-processing', function(htmlPluginData, callback){
            const assets = htmlPluginData.assets;
            const outputName = Path.basename(htmlPluginData.outputName, '.php').split('.')[0];
            const extName = Path.extname(htmlPluginData.outputName);
            let cT = [];
            let jT = [];
            if (outputName == commCssName) {
                htmlPluginData.html = htmlPluginData.html.replace('<head>', '').replace('</head>', '');
            } 
            for(const outputUrl of assets.js) {
                //let cssContent = fs.readFileSync(commCssTpl);
                //if (injectExclude.indexOf(outputName) == -1) {
                if (htmlPluginData.outputName.indexOf('dist/pages') > 0) {//临时解决，处理公共php文件插入到那里的问题
                   if (extName == '.php') {
                       commCssTpl.map(function(item) {
                           cT.push('<?php include(' + phpControllerRoot + '"' + item + '"' + ');?>');  
                       });
                       commJsTpl.map(function(item) {
                           jT.push('<?php include(' + phpControllerRoot + '"' + item + '"' + ');?>');  
                       });
                        handleInsert(htmlPluginData, cT, jT);
                  // } else if (extName == '.html') {
                  //     commCssTpl.map(function(item) {
                  //         if (fs.existsSync(Path.resolve(feParentPath,item ))) {
                  //             let cssContent = fs.readFileSync(Path.resolve(feParentPath,item ));
                  //             cT.push(cssContent);  
                  //         }
                  //     });
                  //     commJsTpl.map(function(item) {
                  //         if (fs.existsSync(Path.resolve(feParentPath,item ))) {
                  //             let jsContent = fs.readFileSync(Path.resolve(feParentPath,item ));
                  //             jT.push(jsContent);  
                  //         }
                  //     });
                  //      handleInsert(htmlPluginData, cT, jT);
                   }
                }
            }
            callback(null, htmlPluginData);        
        });
    });
}
module.exports = HtmlWebpackCustomPlugin;
