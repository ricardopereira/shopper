var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var notify = require('gulp-notify');
var livereload = require('gulp-livereload');
 
// Task
gulp.task('default', function() {
	livereload.listen();
	nodemon({
		script: 'index.js',
		ext: 'js'
	}).on('restart', function() {
		gulp.src('index.js')
			.pipe(livereload());
	})
})
