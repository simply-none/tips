// 解决webpack < 5的报错
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
// 用于压缩代码（比如删除注释）
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const path = require('path')

const webpack = require('webpack')

const IS_PROD = ['production', 'prod'].includes(process.env.NODE_ENV)

const resolve = dir => path.join(__dirname, dir)

module.exports = {
  // 基本路径：默认情况下部署到域名根路径下，若部署到子路径中需使用它指定子路径
  // 比如www.baidu.com/child/， 则baseUrl: '/child/'
  // baseUrl: './', // vue-cli3.3以下版本使用
  publicPath: './', // vue-cli3.3+新版本使用
  // dist为生产环境构建文件的目录
  outputDir: process.env.outputDir,
  // 放置生成的静态资源 (js、css、img、fonts) 的 (相对于 outputDir 的) 目录。
  assetsDir: 'static',
  // 指定生成的index.html的输出路径（相对于outputDir）
  indexPath: 'index.html',
  // 以多页模式构建应用程序。
  pages: undefined,
  // 默认在生成的静态资源文件名中包含hash控制缓存
  filenameHashing: !IS_PROD,

  // eslint-loader 是否在保存的时候检查，对语法要求严格(在生产构建时禁用eslint-loader)
  lintOnSave: !IS_PROD,
  // 是否包含运行时编译器的Vue构建版本
  runtimeCompiler: true,
  // 生产环境的source map
  productionSourceMap: !IS_PROD,
  // 修改图标icon
  pwa: {
    iconPaths: {
      favicon32: 'favicon.ico',
      favicon16: 'favicon.ico',
      appleTouchIcon: 'favicon.ico',
      maskIcon: 'favicon.ico',
      msTileImage: 'favicon.ico'
    }
  },
  // 调试vue程序
  // configureWebpack: {
  //   devtool: 'source-map'
  // },
  css: {
    extract: false
  },
  configureWebpack: config => {
    // config.devtool = IS_PROD ? 'cheap-module-source-map' : 'eval-cheap-module-source-map';
    config.devtool = 'source-map'
    config.performance = {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    }
    config.resolve = {
      // 配置解析别名
      extensions: ['.js', '.json', '.vue'],
      alias: {
        public: resolve('./public'),
        '@': resolve('./src'),
        assets: resolve('./src/assets'),
        common: resolve('./src/common'),
        components: resolve('./src/components'),
        api: resolve('./src/api'),
        views: resolve('./src/views'),
        test: resolve('./src/test'),
        utils: resolve('./src/utils')
      }
    }
    config.plugins.push(
      new CompressionPlugin({
        test: /\.(js|scss|png)?$/i,
        filename: '[path][base].gz',
        algorithm: 'gzip',
        minRatio: 1,
        deleteOriginalAssets: false
      }),
      new NodePolyfillPlugin(),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      })
    )
    // 删除注释：仅在生产环境下
    if (IS_PROD) {
      config.plugins.push(
        // new UglifyJsPlugin({
        //   uglifyOptions: {
        //     // warnings必须和compress同级，在compress里面会报错
        //     warnings: false,
        //     compress: {
        //       drop_debugger: true,
        //       drop_console: true,
        //       pure_funcs: ['console.log']
        //     }
        //   },
        //   cache: false,
        //   parallel: true
        // })
      )
    }
  },

  chainWebpack: config => {
    // 修复HRM(热更新)失效的问题
    config.resolve.symlinks(true)
    // 引入sass资源全局
    const oneOfsMap = config.module.rule('scss').oneOfs.store
    oneOfsMap.forEach(item => {
      item
        .use('sass-resources-loader')
        .loader('sass-resources-loader')
        .options({
          // 必须是绝对路径引入，否则报错
          // 可是字符串/字符串数组
          // resources: './path/to/resources.scss',
          resources: [path.resolve(__dirname, './src/assets/scss/color.scss')]
        })
        .end()
    })
    // Error: optimization.minimizer() no longer supports being passed an array. Either switch to the new syntax (https://github.com/neutrinojs/webpack-chain#config-optimization-minimizers-adding) or downgrade to webpack-chain 4. If using Vue this likely means a Vue plugin has not yet been updated to support Vue CLI 4+.
    if (process.env.NODE_ENV === 'production') {
      config.optimization.minimizer('js')
      .use(require.resolve('terser-webpack-plugin'), [{
        parallel: true,
        terserOptions: {
          ecma: undefined,
          warnings: false,
          parse: {},
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log'],
          },
          format: {
            comments: false
          }
        },
        extractComments: false
      }])
    } else {
      config.optimization.minimize(false)
    }
  },
  // webpack-dev-server 相关配置：本地开发服务器相关配置
  devServer: {
    // 是否让浏览器同时显示警告和错误
    client: {
      overlay: {
        warnings: false,
        errors: true
      }
    },
    // 是否自动打开浏览器
    open: false,
    // host: 'localhost',
    host: '0.0.0.0',
    port: 8080,
    https: false, // 是否启用https
    hot: true, // 启用webpack的热模块替换功能，每次代码变化将重新刷新
    compress: true, // 是否开启压缩
    proxy: null // 设置代理
  }
}
