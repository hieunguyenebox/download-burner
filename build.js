
var gulp = require('gulp'),
	babel = require('gulp-babel'),
	path = require('path'),
	fs = require('fs');

class GulpMain {

	constructor () {
		
		this.checkWatch()
	}

	isLocal () {

		return process.env.NODE_ENV === 'local'
	}

	dist () {

		return './dist'
	}

	source () {

		return path.resolve(__dirname, 'src') + '/**/*.js'
	}

	checkWatch () {

		if (this.isLocal())
			this.watch = true
		else
			this.watch = false
	}

	buildSource (done) {

		const build = (cb) => {

			gulp.src([this.source(), '!./*/**/gulp*.js', '!./*/**/__mocks__/*.js', '!./*/**/__tests__/*.js'])
				.pipe(babel())
				.pipe(gulp.dest(this.dist()))
				.on('end', () => {

					if (typeof done === 'function')
						cb()
				})
		}

		if (this.watch) {

			build(done)
			gulp.watch(this.source(), build)

		} else {

			build(done)
		}
	}

	run (done) {

		this.buildSource(done)
	}

}

module.exports = new GulpMain

