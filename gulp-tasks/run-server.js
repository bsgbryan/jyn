const gulp = require('gulp');
const nodemon = require('gulp-nodemon');
const conf = require('../gulp-conf/base');

gulp.task('boot-server', function() {
  nodemon({
    script: 'dist/index.js',
    watch: ['lib/*'],
    tasks: ['brew-code:dist'],
    ext: '.coffee.md'
  });
});
