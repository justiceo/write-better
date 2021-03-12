import gulp from 'gulp';
import tsify from 'tsify';
import browserify from 'browserify';
import source from 'vinyl-source-stream';
import del from 'del';
import ts from 'gulp-typescript';
import Jasmine from 'jasmine';
import decache from 'decache';
import puppeteer from 'puppeteer';
import webExt from 'web-ext';

const backgroundScripts = ['src/background-script/background.ts'];
const contentScripts = ['src/content-script/content-script.ts']; // Dependencies are pulled-in autoamtically.
const popupScript = ['src/popup/popup.ts'];
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

const compilePopupScript = () => {
    return browserify()
        .add(popupScript)
        .plugin(tsify, { noImplicitAny: true, target: 'es6' })
        .bundle()
        .on('error', (err) => { console.error(err) })
        .pipe(source('popup.js'))
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

const watchPopupScript = () => {
    gulp.watch(popupScript, gulp.parallel(compilePopupScript));
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

export const build = gulp.parallel(copyAssets, compileBackgroundScript, compileContentScript, compilePopupScript);
build.description = 'compile all sources'

export const test = gulp.series(compileTests, runTest);

export const chromeDemo = () => {
    puppeteer.launch({
        headless: false,
        ignoreDefaultArgs: ["--disable-extensions", "--enable-automation"],
        args: [
            `--disable-extensions-except=${process.env.PWD}/extension`,
            `--load-extension=${process.env.PWD}/extension`,
        ]
    });
}

export const firefoxDemo = () => {
    webExt.cmd.run({ sourceDir: `${process.env.PWD}/extension` }, { shouldExitProgram: true });
}

const defaultTask = gulp.series(clean, build, gulp.parallel(watchBackgroundScript, watchContentScript, watchAssets, watchPopupScript))
defaultTask.description = 'start watching for changes to all source'
export default defaultTask