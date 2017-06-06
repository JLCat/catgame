const gulp = require('gulp');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const rename = require("gulp-rename");
const pump = require('pump')

gulp.task('scripts', (cb) => {
  pump([
    gulp.src('app/es6/*.js'),
    babel({
      presets: ['es2015']
    }),
    uglify(),
    rename({
      suffix: '.min'
    }),
    gulp.dest('docs/js')
  ], cb);
});

gulp.task('styles', (cb) => {
  pump([
    gulp.src('app/sass/*.scss'),
    sass().on('error', sass.logError),
    autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }),
    cleanCSS({
      compatibility: 'ie8'
    }),
    rename({
      suffix: '.min'
    }),
    gulp.dest('docs/css')
  ], cb);
});

gulp.task('watch', () => {
  gulp.watch('app/es6/*.js', ['scripts']);
  gulp.watch('app/sass/*.scss', ['styles']);
});

gulp.task('default', ['scripts', 'styles', 'watch']);
