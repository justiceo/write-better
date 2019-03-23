var gulp = require('gulp');
var tsify = require('tsify');
var browserify = require("browserify");
var sstream = require('vinyl-source-stream');

gulp.task("build", function () {
    return browserify()
        .add("content-script.ts")
        .plugin(tsify, { noImplicitAny: true })
        .bundle()
        .on("error", (err) => {console.error(err)})
        .pipe(sstream('content-script.js'))
        .pipe(gulp.dest("./bin"));
});


gulp.task('default', ['build'], function () {
    gulp.watch(source, ['build']);
});
