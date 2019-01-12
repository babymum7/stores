const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProd ? 'production' : 'development',

  entry: { app: './frontend/js/app.js' },

  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, use: ['babel-loader'] },
      {
        test: /\.(sa|c|sc)ss$/,
        use: isProd
          ? [
              { loader: MiniCssExtractPlugin.loader, options: { publicPath: '/' } },
              { loader: 'css-loader', options: { importLoaders: 2 } },
              'postcss-loader',
              'sass-loader'
            ]
          : [
              { loader: MiniCssExtractPlugin.loader, options: { publicPath: '/' } },
              { loader: 'css-loader', options: { importLoaders: 1 } },
              'sass-loader'
            ]
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              fallback: 'file-loader',
              name: isProd ? '[name].[hash].[ext]' : '[name].[ext]',
              outputPath: `fonts`,
              publicPath: `/fonts`
            }
          }
        ]
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: isProd ? '[name].[hash].[ext]' : '[name].[ext]',
              outputPath: `images`,
              publicPath: `/images`
            }
          }
        ]
      },
      {
        test: /\.(png|jpe?g)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: `images`,
              publicPath: `/images`
            }
          }
        ]
      }
    ]
  },

  output: {
    path: path.join(__dirname, 'public'),
    filename: isProd ? '[name].[hash].bundle.js' : '[name].bundle.js',
    chunkFilename: isProd ? '[name].[hash].bundle.js' : '[name].bundle.js',
    publicPath: '/'
  },

  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },

  devtool: isProd ? 'none' : 'cheap-module-eval-source-map',

  plugins: [
    new MiniCssExtractPlugin({
      filename: isProd ? '[name].[hash].css' : '[name].css'
    }),
    new CleanWebpackPlugin(isProd ? ['public/!(images)', 'public/images/!(uploads)'] : ['public/!(images)'], {
      verbose: false,
      root: __dirname
    }),
    new HtmlWebpackPlugin({
      filename: '../views/layout.pug',
      favicon: './frontend/images/favicon/doughnut.png',
      template: './views/template.pug',
      minify: false
    }),
    new webpack.ProgressPlugin()
  ]
};
