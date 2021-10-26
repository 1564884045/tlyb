const path = require('path')
const isTest = process.env.RUN_ENV === 'test'

const resolve = dir => {
  return path.join(__dirname, dir)
}

process.env.VUE_APP_VERSION = require('./package.json').version
// 测试库环境处理
if (isTest && process.env.NODE_ENV === 'production') {
  process.env.VUE_APP_TEST_ENV = true
  process.env.VUE_APP_BASE_API = process.env.VUE_APP_TEST_BASE_API
  process.env.VUE_APP_UPLOAD_URL = process.env.VUE_APP_TEST_UPLOAD_URL
  process.env.VUE_APP_QINIU_CDN = process.env.VUE_APP_TEST_QINIU_CDN
  process.env.VUE_APP_QINIU_ATM_CDN = process.env.VUE_APP_TEST_QINIU_ATM_CDN
  process.env.VUE_APP_QINIU_ORGIN = process.env.VUE_APP_TEST_QINIU_ORGIN
  process.env.VUE_APP_PARENT_URL = process.env.VUE_APP_TEST_PARENT_URL
  process.env.VUE_APP_DEVICE_AUTH = process.env.VUE_APP_TEST_DEVICE_AUTH
}

module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  productionSourceMap: false, // 不需要生产环境的 source map
  outputDir: isTest ? 'dist-test' : 'dist',
  devServer: {
    disableHostCheck: true,
    port: 8090,
    proxy: {
      '/api': {
        target: process.env.VUE_APP_PROXY_URL,
        ws: true, // 代理websocket
        // logLevel: 'debug',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  },
  chainWebpack: config => {
    // 配置别名
    config.resolve.alias
      .set('@', resolve('src'))
      .set('_v', resolve('src/views'))
      .set('_c', resolve('src/components'))
      .set('_img', resolve('src/assets'))
      .set('_f', resolve('src/assets/font'))
  },
  configureWebpack: config => {
    // 用cdn方式引入
    config.externals = {
      YpRiddler: 'YpRiddler'
    }
    if (process.env.NODE_ENV === 'production') {
      // 去除console和debugger
      config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true
      config.optimization.minimizer[0].options.terserOptions.compress.drop_debugger = true
      // 删除代码注释
      config.optimization.minimizer[0].options.terserOptions.output.comments = false
    }
    config.devtool = 'source-map'
  },
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'stylus',
      patterns: [
        path.resolve(__dirname, './src/styles/variable.styl'),
        path.resolve(__dirname, './src/styles/mixins.styl')
      ]
    }
  }
}
