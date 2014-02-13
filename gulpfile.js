var gulp = require('gulp');
var xlsx2json = require('./');

gulp.task('default', function () {
    gulp.src('./sample/*.xlsx')
        .pipe(xlsx2json())
        .pipe(gulp.dest('./dist'));
});
