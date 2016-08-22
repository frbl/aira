var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var reload = browserSync.reload;


gulp.task('sass', function() {
  console.log('called');
  return gulp.src('app/scss/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('app/styles'))
    .pipe(browserSync.stream());
});

gulp.task('serve', ['sass'], function() {
  browserSync({
    server: './app'
  });

  gulp.watch('app/scss/**/*.scss', ['sass']);
  gulp.watch(['*.html', 'styles/**/*.css', 'scripts/**/*.js'], {
    cwd: 'app'
  }, reload);
});

gulp.task('default', ['serve'], function() {
  // implement
});
