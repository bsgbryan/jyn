const gulp = require('gulp');
const conf = require('../gulp-conf/base');
const babel = require('gulp-babel');

gulp.task('babel', function babeler() {
  return gulp.src(conf.path.lib('**/*.js'))
    .pipe(babel({
      presets: ['lastest']
    }))
    .pipe(gulp.dest(conf.path.dist()));
});
