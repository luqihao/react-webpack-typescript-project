const TerserPlugin = require('terser-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

const { IS_DEV } = require('./contants')

const optimization = IS_DEV
	? {}
	: {
			concatenateModules: false,
			minimize: true,
			minimizer: [
				new TerserPlugin({
					// 注释是否需要提取到一个单独的文件中
					extractComments: false,
					terserOptions: {
						format: {
							// 删除所有的注释
							comments: false,
						},
						compress: true,
					},
				}),
				new CssMinimizerPlugin(), // css压缩插件
			],
			splitChunks: {
				// 这个是重点下面讲
				chunks: 'all',
				minSize: 0,
				cacheGroups: {
					vendor: {
						// 创建一个 custom vendor chunk，其中包含与 RegExp 匹配的某些 node_modules 包
						test: /[\\/]node_modules[\\/](react|react-dom|lodash|moment|mobx|mobx-react-lite|axios)[\\/]/,
						name: 'vendors',
						chunks: 'all',
					},
				},
			},
			runtimeChunk: 'single',
			moduleIds: 'deterministic',
			removeAvailableModules: false,
	  }

module.exports = optimization
