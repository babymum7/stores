const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const devMode = process.env.NODE_ENV;

const js = {
  test: /\.js$/,
  exclude: /node_modules/,
  use: [
    {
      loader: 'babel-loader',
      options: {
        cacheDirectory: true,
        presets: ['@babel/preset-env'],
        plugins: [
          '@babel/plugin-transform-runtime',
          '@babel/plugin-syntax-dynamic-import'
        ]
      }
    }
  ]
};

const sassLoader = {
  loader: 'sass-loader'
};

const postcssLoader = {
  loader: 'postcss-loader',
  options: {
    ident: 'postcss',
    plugins: () => [
      require('autoprefixer')(),
      require('cssnano')()
      // require('postcss-uncss')({
      //   html: './src/html/*.html',
      //   htmlroot: path.resolve(__dirname, 'public'),
      //   ignore: [
      //     '.loading',
      //     '.heart__button--hearted',
      //     '.heart__button--float',
      //     '.popup',
      //     '.active',
      //     '.search__result--active'
      //   ]
      // })
    ]
  }
};

const cssLoader = importLoaders => ({
  loader: 'css-loader',
  options: { importLoaders }
});

const cssExtractLoader = {
  loader: MiniCssExtractPlugin.loader,
  options: { publicPath: '/' }
};

// const styleLoader = 'style-loader';

const css = mode => ({
  test: /\.(sa|c|sc)ss$/,
  exclude: /node_modules/,
  use:
    mode === 'development'
      ? [cssExtractLoader, cssLoader(1), sassLoader]
      : [cssExtractLoader, cssLoader(2), postcssLoader, sassLoader]
});

const font = /\.(eot|ttf|woff|woff2)$/;

const image = /\.(png|jpe?g|svg)$/;

const handlefile = (regExpFile, typeFile) => ({
  test: regExpFile,
  use: [
    {
      loader: 'url-loader',
      options: {
        limit: 8192,
        fallback: 'file-loader',
        name: devMode ? '[name].[ext]' : '[name].[hash].[ext]',
        outputPath: `${typeFile}s`,
        publicPath: `/${typeFile}s`
      }
    }
  ]
});

// prettier-ignore
const clean = devMode === 'development'
  ? ['public/!(404.png|images)']
  : [
    'public/!(404.png|images)',
    'public/images/pictures',
    'public/images/uploads/!(store.png)'
  ];

module.exports = ({ mode } = { mode: 'development' }) => ({
  mode,

  entry: { app: './src/js/app.js' },

  module: {
    rules: [handlefile(font, 'font'), handlefile(image, 'image'), css(mode), js]
  },

  output: {
    path: path.resolve(__dirname, 'public'),
    filename: devMode ? '[name].bundle.js' : '[name].[hash].bundle.js',
    chunkFilename: devMode ? '[name].bundle.js' : '[name].[hash].bundle.js',
    publicPath: '/'
  },

  devtool: devMode ? 'inline-source-map' : 'cheap-module-eval-source-map',

  devServer: {
    contentBase: './public'
  },

  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: devMode ? '[name].css' : '[name].[hash].css'
    }),
    new CleanWebpackPlugin(clean, {
      verbose: false,
      root: __dirname
    }),
    new HtmlWebpackPlugin({
      filename: '../views/layout.pug',
      favicon: './src/images/icons/doughnut.png',
      template: './views/template.pug'
    }),
    new webpack.ProgressPlugin()
  ]
});
