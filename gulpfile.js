var gulp = require('gulp');
var sass = require('gulp-sass');
var jade = require('gulp-jade');
var git = require('gulp-git');
var browserSync = require('browser-sync').create();
var imageop = require('gulp-image-optimization');
var inject = require('gulp-inject');
var bowerFiles = require('main-bower-files');
var ts = require('gulp-typescript');
var gulpSequence = require('gulp-sequence');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var uglifycss = require('gulp-uglifycss');

//Staging
gulp.task('staging:sass', function () {
  return gulp.src("./src/scss/{init,elements,blocks}/*.scss")
    .pipe(sass())
    .pipe(autoprefixer("last 1 version", "> 1%", "ie 8", "ie 7"))
    .pipe(gulp.dest("./staging/css"))
    .pipe(browserSync.stream());
});

gulp.task('staging:jade', function () {
  gulp.src('./src/jade/*.jade')
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest('./staging/'));
});

gulp.task('staging:jade-watch', ['staging:jade'], browserSync.reload);

gulp.task('staging:inject', function () {
  var target = gulp.src('./staging/index.html');
  var sources = gulp.src([
    './staging/css/init/*.css',
    './staging/css/elements/*.css',
    './staging/css/blocks/*.css',
    './staging/js/*.js'
  ], {read: false, ignorePath: 'staging', addRootSlash: false});

  return target
    .pipe(inject(gulp.src(bowerFiles(), {read: false}), {name: 'bower', ignorePath: 'staging', addRootSlash: false}))
    .pipe(inject(sources, {ignorePath: 'staging', addRootSlash: false}))
    .pipe(gulp.dest('./staging'));
});

gulp.task('staging:images', function (cb) {
  gulp.src(['src/img/*.png', 'src/img/*.jpg', 'src/img/*.gif', 'src/img/*.jpeg']).pipe(imageop({
    optimizationLevel: 5,
    progressive: true,
    interlaced: true
  })).pipe(gulp.dest('staging/images')).on('end', cb).on('error', cb);
});

gulp.task('staging:images-watch', ['staging:images'], browserSync.reload);

gulp.task('staging:ts', function () {
  return gulp.src('src/ts/*.ts')
    .pipe(ts({
      noImplicitAny: true
    }))
    .pipe(gulp.dest('staging/js'));
});

gulp.task('staging:ts-watch', ['staging:ts'], browserSync.reload);

gulp.task('staging', gulpSequence('staging:jade', 'staging:ts', 'staging:sass', 'staging:images', 'staging:inject'));

gulp.task('staging:serve', ['staging'], function () {

  browserSync.init({
    server: "./staging",
    browser: ["firefox"]
  });

  gulp.watch("src/scss/**/*.scss", ['staging:sass']);
  gulp.watch("src/jade/**/*.jade", ['staging:jade-watch']);
  gulp.watch("src/img/*.*", ['staging:images-watch']);
  gulp.watch("src/ts/*.ts", ['staging:ts-watch']);
  gulp.watch("staging/**/*.js").on('change', browserSync.reload);
});


// Distributive
gulp.task('dist:sass', function () {
  return gulp.src("./src/scss/{init,elements,blocks}/*.scss")
    .pipe(sass())
    .pipe(autoprefixer("last 1 version", "> 1%", "ie 8", "ie 7"))
    .pipe(concat('style.css'))
    .pipe(gulp.dest("./dist/css"))
    .pipe(browserSync.stream());
});

gulp.task('dist:min-css', function () {
  gulp.src('./dist/css/style.css')
    .pipe(uglifycss())
    .pipe(concat('style.min.css'))
    .pipe(gulp.dest('./dist/css/'));
});

gulp.task('dist:jade', function () {
  gulp.src('./src/jade/*.jade')
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('dist:jade-watch', ['dist:jade'], browserSync.reload);

gulp.task('dist:copy', function () {
  return gulp.src('staging/bower_components/**')
    .pipe(gulp.dest('dist/libraries'));
});

gulp.task('dist:inject', function () {
  var target = gulp.src('./dist/index.html');
  var sources = gulp.src([
    './dist/css/style.css',
    './dist/js/*.js'
  ], {read: false, ignorePath: 'dist', addRootSlash: false});

  return target
    .pipe(inject(gulp.src(bowerFiles({
      paths: {
        bowerDirectory: './dist/libraries',
        bowerrc: './.bowerrc',
        bowerJson: './bower.json'
      }
    }), {base: 'dist/libraries', read: false}), {
      name: 'bower',
      ignorePath: 'dist',
      addRootSlash: false
    }))
    .pipe(inject(sources, {ignorePath: 'dist', addRootSlash: false}))
    .pipe(gulp.dest('./dist'));
});

gulp.task('dist:images', function (cb) {
  gulp.src(['src/img/*.png', 'src/img/*.jpg', 'src/img/*.gif', 'src/img/*.jpeg']).pipe(imageop({
    optimizationLevel: 5,
    progressive: true,
    interlaced: true
  })).pipe(gulp.dest('dist/images')).on('end', cb).on('error', cb);
});

gulp.task('dist:images-watch', ['dist:images'], browserSync.reload);

gulp.task('dist:ts', function () {
  return gulp.src('src/ts/*.ts')
    .pipe(ts({
      noImplicitAny: true
    }))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('dist:ts-watch', ['dist:ts'], browserSync.reload);

gulp.task('dist', gulpSequence('dist:copy', 'dist:jade', 'dist:ts', 'dist:sass', 'dist:min-css', 'dist:images', 'dist:inject'));

gulp.task('dist:serve', ['dist'], function () {

  browserSync.init({
    server: "./dist",
    browser: ["firefox"]
  });

  gulp.watch("src/scss/**/*.scss", ['staging:sass']);
  gulp.watch("src/jade/**/*.jade", ['staging:jade-watch']);
  gulp.watch("src/img/*.*", ['staging:images-watch']);
  gulp.watch("src/ts/*.ts", ['staging:ts-watch']);
  gulp.watch("dist/**/*.js").on('change', browserSync.reload);
});


// GIT

gulp.task('git:commit', function () {
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

gulp.task('git:pull', function () {
  git.exec({args: 'pull'}, function (err, stdout) {
    console.log(err);
    console.log(stdout);
  });
});

gulp.task('git:push', function () {
  git.exec({args: 'push origin develop'}, function (err, stdout) {
    console.log(err);
    console.log(stdout);
  });
});

gulp.task('default', ['staging:serve']);
