const gulp = require('gulp');
const fileinclude = require('gulp-file-include');
const bower = require('gulp-bower');
const less = require('gulp-less');
const env = (process.env.NODE_ENV === 'prod' ? 'prod' : 'development');
const destFolder = {
    'development': './build/debug',
    'prod': './build/production'
};

gulp.task("html", () => {
    return gulp.src(['index.html'])
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file',
            indent: true
        }))
        .pipe(gulp.dest(destFolder[env]));
});

gulp.task("js", () => {
    return gulp.src('./src/app/**/*.js')
        .pipe(gulp.dest(destFolder[env] + '/app'));
});

gulp.task("vendors", (cb) => {
    let stream = gulp.src('./bower.json')
        .pipe(gulp.dest(destFolder[env]));

    stream.once('end', function () {
        bower({ directory: './vendors', cwd: destFolder[env] }, cb)
    });
});

gulp.task('less', function () {
    return gulp.src('./src/assets/styles/**/*.less')
        .pipe(less({}))
        .pipe(gulp.dest(destFolder[env] + '/assets/styles'));
});

gulp.task('fonts', function () {
    return gulp.src('./src/assets/fonts/**/*')
        .pipe(gulp.dest(destFolder[env] + '/assets/fonts'));
});

gulp.task('images', function () {
    return gulp.src('./src/assets/images/**/*')
        .pipe(gulp.dest(destFolder[env] + '/assets/images'));
});

gulp.task('data', function () {
    return gulp.src('./data/**/*')
        .pipe(gulp.dest(destFolder[env] + '/data'));
});

gulp.task('watch', function () {
    gulp.watch('./src/assets/styles/**/*.less', ['less']);
    gulp.watch(['index.html', './src/app/views/**/*.html'], ['html']);
    gulp.watch(['./src/app/**/*.html'], ['js']);
});

gulp.task('default', ['html', 'js', 'vendors', 'less', 'fonts', 'images', 'data']);