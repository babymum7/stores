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
