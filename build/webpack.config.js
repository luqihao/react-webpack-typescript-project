const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = (env) => {
  const IS_DEV = env.development
  const IS_PROD = env.production

  return {
    devtool: 'source-map',
    entry: {
      index: ['./src/index.tsx'],
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
                patterns: [path.resolve(__dirname, '../src/styles/*.scss')],
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
            filename: 'images/[name]_[hash][ext][query]',
          },
        },
        {
          test: /\.(eot|svg|ttf|woff|woff2?)$/,
          type: 'asset/resource', // webpack5自带的loader，webpack4依赖file-loader
          generator: {
            filename: 'fonts/[name]_[hash][ext][query]',
          },
        },
        {
          test: /\.(svg)$/,
          type: 'asset/resource', // webpack5自带的loader，webpack4依赖file-loader
          generator: {
            filename: 'svgs/[name]_[hash][ext][query]',
          },
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
      filename: 'js/[name].[hash].js',
      path: path.resolve(__dirname, '../dist'),
      assetModuleFilename: 'images/[hash][ext][query]', // asset loader处理出来的文件
      clean: true,
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './index.html',
      }),
      new MiniCssExtractPlugin({
        // 与 webpackOptions.output 中的选项相似
        // 所有的选项都是可选的
        filename: IS_PROD ? 'css/[name].[contenthash].css' : '[name].css',
        chunkFilename: IS_PROD
          ? 'css/[name].[id].[contenthash].css'
          : '[name].[id].[contenthash].css',
        ignoreOrder: true,
      }),
    ],
    devServer: {
      compress: true,
      port: 9000,
      host: '0.0.0.0',
    },
  }
}
