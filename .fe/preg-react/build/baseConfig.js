const path = require('path');
const nodeArgs = JSON.parse(process.env.npm_config_argv);
const isHtml = nodeArgs.original.indexOf('--html');
const extname = isHtml > -1 ? '.html' : '.php';

module.exports = {
  paths: {
      projectName: path.basename(path.resolve(__dirname, '../')),
      feParentPath: path.resolve(__dirname, '../../../'),
      phpControllerRoot: '$Preg_FE_base_path.',
      phpStaticPre: '/fe_static', 
  },
  cli: {
      isHtml: isHtml,
      extname: extname
  },
}
