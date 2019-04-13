import gulp from 'gulp';
import tsify from 'tsify';
import browserify from 'browserify';
import source from 'vinyl-source-stream';
import del from 'del';
import ts from 'gulp-typescript';
import Jasmine from 'jasmine';
import decache from 'decache';

const bgSrc = ['src/background.ts', 'src/shared.ts'];
const csSrc = ['src/content-script.ts', 'src/model.ts', 'src/shared.ts', 'src/ui.ts'];
const testSrc = ['spec/**/*.ts'];
const assets = ['assets/**/*'];
const outDir = './extension';
const jasmine = new Jasmine();

jasmine.loadConfig({
    spec_files: ['spec/**/*.js'],
    random: false,
});

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

const compileTests = () => {
    return gulp.src(testSrc)
        .pipe(ts({
            noImplicitAny: true,
        }))
        .pipe(gulp.dest('spec'));
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

export const watchTests = () => {
    return gulp.watch(testSrc, gulp.series(compileTests, runTest));
}

const runTest = () => {
    return new Promise((resolve, reject) => {
        jasmine.onComplete(passed => {
            if (passed) {
                console.log('All specs have passed');
                // multiple execute calls on jasmine env errors. See https://github.com/jasmine/jasmine/issues/1231#issuecomment-26404527
                jasmine.specFiles.forEach(f => decache(f));
                resolve();
            }
            else {
                jasmine.specFiles.forEach(f => decache(f));
                reject();
            }
        });
        jasmine.execute();
    });
}

export const clean = () => del([outDir]);
clean.description = 'clean the output directory'

export const build = gulp.parallel(copyAssets, compileBgScript, compileContentScript);
build.description = 'compile all sources'

export const test = gulp.series(compileTests, runTest);

const defaultTask = gulp.series(clean, build, gulp.parallel(watchBackgroundScript, watchContentScript, watchAssets))
defaultTask.description = 'start watching for changes to all source'
export default defaultTask