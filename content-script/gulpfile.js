var gulp = require('gulp');
var tsify = require('tsify');
var browserify = require('gulp-browserify');
var rename = require('gulp-rename');

source = ['content-script.ts'];

gulp.task('build', function () {
    return gulp
        .src(source, { read: false })
        .pipe(browserify({
            plugin: ['tsify'],
        }))
        .pipe(rename('content-script.js'))
        .pipe(gulp.dest('./bin'));
});

gulp.task('default', ['build'], function () {
    gulp.watch(source, ['build']);
});
