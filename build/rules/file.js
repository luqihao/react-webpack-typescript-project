module.exports = [
	{
		test: [/\.gif$/, /\.jpe?g$/, /\.png$/, /\.webp$/],
		type: 'asset', // webpack5自带的loader，webpack4依赖file-loader
		parser: {
			dataUrlCondition: {
				maxSize: 1024 * 4
			}
		},
		generator: {
			filename: 'static/images/[name]_[contenthash:8][ext][query]'
		}
	},
	{
		test: /\.(eot|svg|ttf|woff|woff2?)$/,
		type: 'asset/resource', // webpack5自带的loader，webpack4依赖file-loader
		generator: {
			filename: 'static/fonts/[name]_[contenthash:8][ext][query]'
		}
	},
	{
		test: /\.(svg)$/,
		type: 'asset/resource', // webpack5自带的loader，webpack4依赖file-loader
		generator: {
			filename: 'static/svgs/[name]_[contenthash:8][ext][query]'
		}
	}
]
