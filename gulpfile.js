var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var concat = require('gulp-concat');
var autoprefixer = require('gulp-autoprefixer');
var minifyCSS = require('gulp-minify-css');
var util = require('gulp-util');
var jade = require('gulp-jade');

// Static Server + watching scss/jade files
gulp.task('serve', ['sass', 'templates'], function () {

  browserSync.init({
    server: "./app"
  });

  gulp.watch("scss/*.scss", ['sass']);
  gulp.watch("jade/**/*.jade", ['templates']);
  gulp.watch("jade/**/*.jade").on('change', browserSync.reload);
  gulp.watch("scss/*.scss").on('change', browserSync.reload);
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function () {
  return gulp.src("scss/style.scss")
    .pipe(sass())
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulp.dest("app/css"))
    .pipe(browserSync.stream());
});

gulp.task('minify', function () {
  gulp.src([
    'app/css/style.css'
  ])
    .pipe(plumber())
    .pipe(minifyCSS({processImport: false}))
    .pipe(concat('style.min.css'))
    .pipe(plumber.stop())
    .pipe(gulp.dest('app/css'));
});

gulp.task('templates', function () {
  gulp.src('./jade/*.jade')
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest('./app/'))
    .pipe(browserSync.stream());
});

gulp.task('default', ['serve']);