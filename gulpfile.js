var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var concat = require('gulp-concat');
var autoprefixer = require('gulp-autoprefixer');
var minifyCSS = require('gulp-minify-css');
var util = require('gulp-util');
var jade = require('gulp-jade');
var git = require('gulp-git');

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
    .pipe(gulp.dest("dist/css"))
    .pipe(browserSync.stream());
});

gulp.task('minify', function () {
  gulp.src([
      'dist/css/style.css',
      'dist/js/libraries/bootstrap/dist/css/bootstrap.css'
    ])
    .pipe(plumber())
    .pipe(minifyCSS({processImport: false}))
    .pipe(concat('style.min.css'))
    .pipe(plumber.stop())
    .pipe(gulp.dest('dist/css'));
});

gulp.task('templates', function () {
  gulp.src('./jade/*.jade')
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest('./dist/'))
    .pipe(browserSync.stream());
});

gulp.task('commit', function () {
  git.exec({args: 'add -A'}, function (err, stdout) {
    git.exec({args: 'diff --name-status --cached --raw'}, function (err, stdout) {
      var message = stdout.replace(/\t/g, " - ").replace(/\n/g, ";\n");
      git.exec({args: 'commit -m "' + message + '"'}, function (err, stdout) {
        console.log(err);
        console.log(stdout);
      });
    });
  });
});

gulp.task('pull', function () {
  git.exec({args: 'pull'}, function (err, stdout) {
    console.log(err);
    console.log(stdout);
  });
});

gulp.task('push', function () {
  git.exec({args: 'push'}, function (err, stdout) {
    console.log(err);
    console.log(stdout);
  });
});

gulp.task('default', ['serve']);
