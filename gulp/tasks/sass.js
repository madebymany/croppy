var plumber  = require('gulp-plumber');
var gulp = require('gulp');
var sass = require('gulp-sass');
var config = require('../config').sass;
var assign = require("object.assign");
var rename = require("gulp-rename");

gulp.task('sass', function () {

  var opts =
    assign({}, global.isWatching ? config.opts.dev : config.opts.build, config.includes);

  return gulp.src(config.src)
    .pipe(plumber())
    .pipe(sass(opts))
    .pipe(rename("imageine-that.css"))
    .pipe(gulp.dest(config.dest));
});
