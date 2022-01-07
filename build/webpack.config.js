const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

const rules = require('./rules')
const plugins = require('./plugins')
const optimization = require('./optimization')
const { file_extensions, IS_DEV } = require('./contants')
const { resolve } = require('./utils')

module.exports = env => {
	// 可以通过命令行--config设置env值，但只有这个配置文件能访问得到，各种配置模块化需要逐个传递很不方便
	// 所以还是使用cross-env设置环境变量通过process.env去访问算了
	return {
		devtool: IS_DEV ? 'source-map' : false,
		entry: {
			index: ['./src/index.tsx'],
		},
		output: {
			// contenthash，只要模块内容不变，hash值就不变，打包也就更快
			filename: 'static/js/[name].[contenthash:8].js',
			path: resolve('dist'),
			clean: true,
		},
		module: {
			rules,
		},
		resolve: {
			extensions: file_extensions,
			plugins: [
				// 使用tsconfig里面配置的paths而不需要再重新配置alias
				new TsconfigPathsPlugin({
					configFile: resolve('tsconfig.json'),
					extensions: file_extensions,
				}),
			],
		},
		plugins,
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
		optimization,
		devServer: IS_DEV
			? {
					compress: true,
					port: 9000,
					host: '0.0.0.0',
			  }
			: undefined,
	}
}
