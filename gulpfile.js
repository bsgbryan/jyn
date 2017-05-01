const gulp = require('gulp');
const HubRegistry = require('gulp-hub');
const conf = require('./gulp-conf/base');
const hub = new HubRegistry([conf.path.tasks('*.js')]);

gulp.registry(hub);

gulp.task('default', gulp.series(
  'clean',
  'brew-code:dev',
  'brew-tests',
  'pre-test',
  'run-tests',
  'watch'
));

gulp.task('dist', gulp.series('clean', 'brew-code:dist'));

gulp.task('run-server', gulp.series('dist', 'boot-server'));

gulp.task('compile', gulp.series('clean', 'brew-code:dev'));

gulp.task('prepublish', gulp.series('nsp'));

gulp.task('watch', function watch() {
  gulp.watch(conf.path.lib('**/*.coffee.md'), gulp.series('brew-code:dev', 'pre-test', 'run-tests'));
  gulp.watch(conf.path.test('**/*.coffee.md'), gulp.series('brew-tests', 'pre-test', 'run-tests'));
});
