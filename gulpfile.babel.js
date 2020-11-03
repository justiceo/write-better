import gulp from 'gulp';
import tsify from 'tsify';
import browserify from 'browserify';
import source from 'vinyl-source-stream';
import del from 'del';
import ts from 'gulp-typescript';
import Jasmine from 'jasmine';
import decache from 'decache';

const backgroundScripts = ['src/background-script/background.ts', 'src/shared/shared.ts'];
const contentScripts = ['src/content-script/content-script.ts', 'src/content-script/model.ts','src/content-script/ui.ts', 'src/shared/shared.ts'];
const testSpecs = ['spec/**/*.ts'];
const assets = ['assets/**/*'];
const outDir = './extension';

const compileBackgroundScript = () => {
    return browserify()
        .add(backgroundScripts)
        .plugin(tsify, { noImplicitAny: true, target: 'es6' })
        .bundle()
        .on('error', (err) => { console.error(err) })
        .pipe(source('background.js'))
        .pipe(gulp.dest(outDir))
}

const compileContentScript = () => {
    return browserify()
        .add(contentScripts)
        .plugin(tsify, { noImplicitAny: true, target: 'es6' })
        .bundle()
        .on('error', (err) => { console.error(err) })
        .pipe(source('content-script.js'))
        .pipe(gulp.dest(outDir))
}

const compileTests = () => {
    return gulp.src(testSpecs)
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
    gulp.watch(backgroundScripts, gulp.parallel(compileBackgroundScript));
}

const watchContentScript = () => {
    gulp.watch(contentScripts, gulp.parallel(compileContentScript));
}

const watchAssets = () => {
    gulp.watch(assets, copyAssets);
}

export const watchTests = () => {
    return gulp.watch(testSpecs, gulp.series(compileTests, runTest));
}

export const runTest = () => {
    return new Promise((resolve, reject) => {
        const jasmine = new Jasmine();
        jasmine.loadConfig({
            spec_files: ['spec/**/*.js'],
            random: false,
        });
        jasmine.onComplete(passed => {
            // multiple execute calls on jasmine env errors. See https://github.com/jasmine/jasmine/issues/1231#issuecomment-26404527
            jasmine.specFiles.forEach(f => decache(f));
            resolve();
        });
        jasmine.execute();
    });
}

export const clean = () => del([outDir]);
clean.description = 'clean the output directory'

export const build = gulp.parallel(copyAssets, compileBackgroundScript, compileContentScript);
build.description = 'compile all sources'

export const test = gulp.series(compileTests, runTest);

const defaultTask = gulp.series(clean, build, gulp.parallel(watchBackgroundScript, watchContentScript, watchAssets))
defaultTask.description = 'start watching for changes to all source'
export default defaultTask