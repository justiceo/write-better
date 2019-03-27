import gulp from 'gulp';
import tsify from 'tsify';
import browserify from 'browserify';
import source from 'vinyl-source-stream';
import del from 'del';

const bgSrc = ['src/background.ts', 'src/shared.ts'];
const csSrc = ['src/content-script.ts', 'src/model.ts', 'src/shared.ts'];
const assets = ['assets/*'];
const outDir = './extension';

const compileBgScript = () => {
    return browserify()
        .add(bgSrc)
        .plugin(tsify, { noImplicitAny: true })
        .bundle()
        .on('error', (err) => { console.error(err) })
        .pipe(source('background.js'))
        .pipe(gulp.dest(outDir))
}
const compileContentScript = () => {
    return browserify()
        .add(csSrc)
        .plugin(tsify, { noImplicitAny: true })
        .bundle()
        .on('error', (err) => { console.error(err) })
        .pipe(source('content-script.js'))
        .pipe(gulp.dest(outDir))
}

export const copyAssets = () => {
    return gulp.src(assets)
        .pipe(gulp.dest(outDir));
}

const watchBackgroundScript = () => {
    gulp.watch(bgSrc, gulp.parallel(compileBgScript));
}
const watchContentScript = () => {
    gulp.watch(csSrc, gulp.parallel(compileContentScript));
}

const watchAssets = () => {
    gulp.watch(assets, copyAssets);
}

export const clean = () => del([outDir]);
clean.description = 'clean the output directory'

export const build = gulp.parallel(copyAssets, compileBgScript, compileContentScript)
build.description = 'compile all sources'

const defaultTask = gulp.series(clean, build, gulp.parallel(watchBackgroundScript, watchContentScript, watchAssets))
defaultTask.description = 'start watching for changes to all source'
export default defaultTask