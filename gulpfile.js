var gulp = require('gulp'),
	del = require('del'),
	build = require('./build')

gulp.task('build', (done) => {

	del(['dist']).then(() => {

		build.run(done)
	})
})