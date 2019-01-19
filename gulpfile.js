let gulp = require('gulp'),
    scss = require('gulp-sass'),
    scssSrc = './src/scss/**/*.scss';

gulp.task('scss', function () {
    gulp.src(scssSrc)
        .pipe(scss({
            linefeed: 'crlf'
            // outputStyle: 'expanded',
            // indentWidth: 4
        }))
        .pipe(gulp.dest('./dist'));
});



gulp.task('testWatch', function () {
    gulp.watch(scssSrc, ['scss']);
});

gulp.task('default', ['scss']);