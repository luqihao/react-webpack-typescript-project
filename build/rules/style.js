const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const { resolve } = require('./../utils')
const { IS_DEV, IS_PROD } = require('./../contants')
const theme = require('./../../theme')

const getCssLoaders = (importLoaders, modules) => [
	IS_DEV ? 'style-loader' : MiniCssExtractPlugin.loader,
	{
		loader: 'css-loader',
		options: {
			modules,
			sourceMap: IS_DEV,
			importLoaders,
		},
	},
	{
		loader: 'postcss-loader',
		options: {
			postcssOptions: {
				plugins: [
					require('postcss-flexbugs-fixes'),
					IS_PROD && [
						// 开发环境不使用postcss-preset-env加浏览器前缀，加快打包时间
						'postcss-preset-env',
						{
							autoprefixer: {
								grid: true,
								flexbox: 'no-2009',
							},
							stage: 3,
						},
					],
				].filter(Boolean),
			},
		},
	},
]

module.exports = [
	{
		test: /\.css$/i,
		use: getCssLoaders(1, false),
	},
	{
		test: /\.scss$/,
		use: [
			...getCssLoaders(2, true),
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
					patterns: [resolve('src/styles/*.scss')],
				},
			},
		],
	},
	{
		// for ant design
		test: /\.less$/,
		use: [
			...getCssLoaders(2, false),
			{
				loader: 'less-loader',
				options: {
					lessOptions: {
						javascriptEnabled: true,
						modifyVars: theme,
					},
				},
			},
		],
	},
]
