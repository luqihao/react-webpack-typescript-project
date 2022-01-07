const { resolve } = require('./../utils')

module.exports = [
	{
		// worker-loader官网说着不适用webpack5，实际还是支持的
		test: /\.worker\.ts$/,
		include: [resolve('src/workers')],
		use: [
			{
				loader: 'worker-loader',
				options: {
					inline: 'fallback',
					filename: 'static/workers/[name].[contenthash:8].js',
				},
			},
		],
	},
	{
		test: /\.(j|t)sx?$/,
		loader: 'babel-loader',
		options: { cacheDirectory: true },
		exclude: /node_modules/,
	},
]
