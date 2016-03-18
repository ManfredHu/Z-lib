var gulp = require('gulp'),
    minifycss = require('gulp-minify-css'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    del = require('del');

//压缩js
gulp.task('minifyjs', function() {
    return gulp.src('Z/*.js')
        .pipe(concat('Z.js')) //合并所有js到main.js
        .pipe(gulp.dest('Z-min')) //输出main.js到文件夹
        .pipe(rename({ suffix: '.min' })) //rename压缩后的文件名
        .pipe(uglify()) //压缩
        .pipe(gulp.dest('Z-min')); //输出
});

// 执行压缩前，先删除文件夹里的内容
// gulp.task('clean', function(cb) {
//     del(['minified/js'], cb)
// });

//默认命令，在cmd中输入gulp后，执行的就是这个命令
gulp.task('default', function() {
    gulp.start('minifyjs');
});
