const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin').default
const { GenerateSW } = require('workbox-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin')

const { IS_DEV, IS_PROD, APP_ENV } = require('./contants')
const envJson = require('./env.json')

const baseEnv = {
	IS_DEV,
	IS_PROD,
	// 当前分支，区分生产环境、预生产环境、测试环境
	// 为何要用JSON.stringfy，请看https://webpack.docschina.org/plugins/define-plugin
	APP_ENV: JSON.stringify(APP_ENV),
}

if (envJson[APP_ENV]) {
	for (const key in envJson[APP_ENV]) {
		envJson[APP_ENV][key] = JSON.stringify(envJson[APP_ENV][key])
	}
	Object.assign(baseEnv, envJson[APP_ENV])
}

const basePlugins = [
	new HtmlWebpackPlugin({
		template: path.resolve(__dirname, './templates/index.html'),
		chunks: ['index'],
	}),
	// webpack5移除了process之类的（说是process是属于node，前端不应该有这个东西）
	// 需要自己定义环境变量，然后就可以通过代码访问了
	new webpack.DefinePlugin(baseEnv),
	new AntdDayjsWebpackPlugin(),
	// new BundleAnalyzerPlugin({
	// 	analyzerPort: IS_PROD ? 9999 : 8888,
	// }),
]

const prodPlugins = [
	new MiniCssExtractPlugin({
		// 与 webpackOptions.output 中的选项相似
		// 所有的选项都是可选的
		filename: 'static/css/[name].[contenthash:8].css',
		ignoreOrder: true,
	}),
	new GenerateSW({
		// 这些选项帮助快速启用 ServiceWorkers
		// 不允许遗留任何“旧的” ServiceWorkers
		clientsClaim: true,
		skipWaiting: true,
		// 文件字体过大，需要重新设置最大值，要不然会报错，如果没有文件字体的话可以忽略这个参数
		maximumFileSizeToCacheInBytes: 20 * 1024 * 1024,
	}),
	new webpack.ProgressPlugin((percentage, message, ...args) => {
		// e.g. Output each progress message directly to the console:
		console.info(percentage, message, ...args)
	}),
	new BundleAnalyzerPlugin(),
]

module.exports = IS_PROD ? [...basePlugins, ...prodPlugins] : basePlugins
