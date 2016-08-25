var gulp = require('gulp');

// Compiles scss to css
var sass = require('gulp-sass');

var browserSync = require('browser-sync');
var reload = browserSync.reload;


/**
 * Task to compile scss to sass
 */
gulp.task('sass', function() {
  return gulp.src('app/scss/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('app/styles'))
    .pipe(browserSync.stream());
});

gulp.task('vendor', function() {
  gulp.src('bower_components/**/*min.js', {
      base: 'bower_components'
    })
    .pipe(gulp.dest('app/vendor/js/'));
});

/**
 * Task to run the application
 */
gulp.task('serve', ['sass'], function() {
  browserSync({
    server: './app'
  });

  gulp.watch('app/scss/**/*.scss', ['sass']);
  gulp.watch(['*.html', 'styles/**/*.css', 'scripts/**/*.js'], {
    cwd: 'app'
  }, reload);
});

gulp.task('default', ['vendor', 'serve'], function() {
  // implement
});
