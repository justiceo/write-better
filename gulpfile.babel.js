import gulp from 'gulp';
import tsify from 'tsify';
import browserify from 'browserify';
import source from 'vinyl-source-stream';
import del from 'del';
import buffer from 'vinyl-buffer';
import sourcemaps from 'gulp-sourcemaps';

const bgSrc = ['background.ts', 'model.ts'];
const csSrc = ['content-script.ts', 'model.ts'];
const outDir = './bin';

export const compileBgScript = () => {
    return browserify({ entries: bgSrc, debug: true })
        .plugin(tsify, { noImplicitAny: true })
        .bundle()
        .on('error', (err) => { console.error(err) })
        .pipe(source('background.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(outDir))
}
export const compileContentScript = () => {
    return browserify({ entries: csSrc, debug: true })
        .plugin(tsify, { noImplicitAny: true })
        .bundle()
        .on('error', (err) => { console.error(err) })
        .pipe(source('content-script.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(outDir))
}

const watchBackgroundScript = () => {
    gulp.watch(bgSrc, gulp.parallel(compileBgScript));
}
const watchContentScript = () => {
    gulp.watch(csSrc, gulp.parallel(compileContentScript));
}

export const clean = () => del([outDir]);
clean.description = 'clean the output directory'

export const build = gulp.parallel(compileBgScript, compileContentScript)
build.description = 'compile all sources'

const defaultTask = gulp.series(clean, build, gulp.parallel(watchBackgroundScript, watchContentScript))
defaultTask.description = 'start watching for changes to all source'
export default defaultTask