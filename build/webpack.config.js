const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

module.exports = (env, ...rest) => {
	console.log('env', env)
	console.log('rest', rest)
	const IS_DEV = env.development
	const IS_PROD = env.production
	const { APP_ENV } = env

	return {
		devtool: IS_DEV ? 'source-map' : false,
		entry: {
			index: ['./src/index.tsx'],
			// testSplit: ['./src/test_split.tsx'],
			// index: {
			// 	import: './src/index.tsx',
			// 	dependOn: 'shared',
			// },
			// testSplit: {
			// 	import: './src/test_split.tsx',
			// 	dependOn: 'shared',
			// },
			// shared: ['lodash', 'react'],
		},
		module: {
			rules: [
				{
					test: /\.tsx?$/,
					loader: 'babel-loader',
					options: { cacheDirectory: true },
					exclude: /node_modules/,
				},
				{
					test: /\.css$/i,
					use: [
						IS_DEV ? 'style-loader' : MiniCssExtractPlugin.loader,
						'css-loader',
						{
							loader: 'postcss-loader',
							//   options: {
							//     postcssOptions: {
							//       plugins: [
							//         IS_PROD && [
							//           // 开发环境不使用postcss-preset-env加浏览器前缀，加快打包时间
							//           'postcss-preset-env',
							//           {
							//             autoprefixer: {
							//               grid: true,
							//               flexbox: 'no-2009',
							//             },
							//             stage: 3,
							//           },
							//         ],
							//       ].filter(Boolean),
							//     },
							//   },
						},
					],
				},
				{
					test: /\.scss$/,
					use: [
						IS_DEV ? 'style-loader' : MiniCssExtractPlugin.loader,
						{
							loader: 'css-loader',
							options: {
								modules: true,
								sourceMap: IS_DEV,
							},
						},
						{
							loader: 'postcss-loader',
							//   options: {
							//     postcssOptions: {
							//       plugins: [
							//         require('postcss-flexbugs-fixes'),
							//         IS_PROD && [
							//           // 开发环境不使用postcss-preset-env加浏览器前缀，加快打包时间
							//           'postcss-preset-env',
							//           {
							//             autoprefixer: {
							//               grid: true,
							//               flexbox: 'no-2009',
							//             },
							//             stage: 3,
							//           },
							//         ],
							//       ].filter(Boolean),
							//     },
							//   },
						},
						{
							loader: 'sass-loader',
							options: {
								sourceMap: IS_DEV,
							},
						},
						// 避免重复在每个样式文件中@import导入，在各个css 文件中能够直接使用变量和公共的样式
						{
							loader: 'style-resources-loader',
							options: {
								patterns: [
									path.resolve(
										__dirname,
										'../src/styles/*.scss'
									),
								],
							},
						},
					],
				},
				{
					test: [/\.gif$/, /\.jpe?g$/, /\.png$/, /\.webp$/],
					type: 'asset', // webpack5自带的loader，webpack4依赖file-loader
					parser: {
						dataUrlCondition: {
							maxSize: 1024 * 4,
						},
					},
					generator: {
						filename: 'images/[name]_[contenthash:8][ext][query]',
					},
				},
				{
					test: /\.(eot|svg|ttf|woff|woff2?)$/,
					type: 'asset/resource', // webpack5自带的loader，webpack4依赖file-loader
					generator: {
						filename: 'fonts/[name]_[contenthash:8][ext][query]',
					},
				},
				{
					test: /\.(svg)$/,
					type: 'asset/resource', // webpack5自带的loader，webpack4依赖file-loader
					generator: {
						filename: 'svgs/[name]_[contenthash:8][ext][query]',
					},
				},
			],
		},
		resolve: {
			extensions: ['.ts', '.tsx', '.js', '.jsx'],
			plugins: [
				// 使用tsconfig里面配置的paths而不需要再重新配置alias
				new TsconfigPathsPlugin({
					configFile: path.resolve(__dirname, '../tsconfig.json'),
					extensions: ['.ts', '.tsx', '.js', '.jsx'],
				}),
			],
		},
		output: {
			// contenthash:8，只要模块内容不变，hash值就不变，打包也就更快
			filename: 'js/[name].[contenthash:8].js',
			path: path.resolve(__dirname, '../dist'),
			clean: true,
		},
		plugins: [
			new HtmlWebpackPlugin({
				template: './index.html',
			}),
			new MiniCssExtractPlugin({
				// 与 webpackOptions.output 中的选项相似
				// 所有的选项都是可选的
				filename: IS_PROD
					? 'css/[name].[contenthash:8].css'
					: '[name].css',
				chunkFilename: IS_PROD
					? 'css/[name].[id].[contenthash:8].css'
					: '[name].[id].[contenthash:8].css',
				ignoreOrder: true,
			}),
			// webpack5移除了process之类的（说是process是属于node，前端不应该有这个东西）
			// 需要自己定义环境变量，然后就可以通过代码访问了
			new webpack.DefinePlugin({
				IS_DEV,
				IS_PROD,
				// 当前分支，区分生产环境、预生产环境、测试环境
				// 为何要用JSON.stringfy，请看https://webpack.docschina.org/plugins/define-plugin
				APP_ENV: JSON.stringify(APP_ENV),
			}),
		],
		devServer: {
			compress: true,
			port: 9000,
			host: '0.0.0.0',
		},
		cache: {
			// 默认type是memory也就是缓存放到内存中
			// 当设置 cache.type: "filesystem" 时，webpack 会在内部以分层方式启用文件系统缓存和内存缓存。
			// 从缓存读取时，会先查看内存缓存，如果内存缓存未找到，则降级到文件系统缓存。
			// 写入缓存将同时写入内存缓存和文件系统缓存。也就是说它比memory模式更好
			type: 'filesystem',
			buildDependencies: {
				config: [__filename],
			},
		},
		optimization: {
			concatenateModules: false,
			minimizer: [
				new TerserPlugin({
					extractComments: false,
					terserOptions: {
						format: {
							// 删除所有的注释
							comments: true,
						},
						compress: {
							// 删除未引用的函数和变量
							unused: true,
							// 删掉 debugger
							drop_debugger: true,
							// 删除无法访问的代码
							dead_code: true,
							unsafe_undefined: true,
						},
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
						test: /[\\/]node_modules[\\/](react|react-dom|lodash|moment|mobx|mobx-react|axios)[\\/]/,
						name: 'vendors',
						chunks: 'all',
					},
				},
			},
			runtimeChunk: 'single',
			moduleIds: 'deterministic',
			removeAvailableModules: false,
		},
	}
}
