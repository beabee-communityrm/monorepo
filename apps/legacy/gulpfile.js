const autoprefixer = require('autoprefixer');
const gulp = require('gulp');
const { dirname } = require('path');
const postcss = require('gulp-postcss');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');

const paths = {
  css: {
    src: './src/static/scss/**/*.scss',
    dest: './dist/static/css',
  },
  staticFiles: {
    src: ['./src/static/**/*', '!./src/static/scss/**/*'],
    dest: './dist/static',
  },
  appFiles: {
    src: ['./src/**/*.{json,pug,sql}'],
    dest: './dist',
  },
};

function buildCSS() {
  return gulp
    .src(paths.css.src)
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        includePaths: [dirname(require.resolve('bootstrap-sass/package.json'))],
      }).on('error', sass.logError)
    )
    .pipe(postcss([autoprefixer()]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.css.dest));
}

function copyStaticFiles() {
  return gulp
    .src(paths.staticFiles.src, {
      base: './src/static',
      since: gulp.lastRun(copyStaticFiles),
    })
    .pipe(gulp.dest(paths.staticFiles.dest));
}

function copyAppFiles() {
  return gulp
    .src(paths.appFiles.src, {
      base: './src',
      since: gulp.lastRun(copyAppFiles),
    })
    .pipe(gulp.dest(paths.appFiles.dest));
}

const build = gulp.parallel(buildCSS, copyStaticFiles, copyAppFiles);

function watch() {
  gulp.watch(paths.css.src, buildCSS);
  gulp.watch(paths.staticFiles.src, copyStaticFiles);
  gulp.watch(paths.appFiles.src, copyAppFiles);
}

module.exports = {
  default: gulp.series(build, watch),
  build,
  watch,
};
