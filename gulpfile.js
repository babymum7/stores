const gulp = require('gulp');
const pug = require('gulp-pug');
const browserSync = require('browser-sync').create();

/* prettier-ignore */
gulp.task('pug', () => gulp
  .src('./views/*.pug')
  .pipe(pug())
  .pipe(gulp.dest('./src/html')));

gulp.task('reload', done => {
  browserSync.reload();
  done();
});

gulp.task('serve', () => {
  browserSync.init({
    proxy: 'https://localhost:6969',
    https: {
      cert: './ssl/server.crt',
      key: './ssl/server.key'
    },
    port: 9696,
    browser: 'chrome'
  });
  gulp.watch(['./views/**/*.pug', './src/js/**/*.js'], gulp.series('reload'));
});
