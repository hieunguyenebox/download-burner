
var fs = require('fs')

var path = require('path')

var md5 = require('md5')

var Promise = require("bluebird");

var async = Promise.promisify(require('async').series)

const joinFiles = (downloadFileName, connection, length) => {

	let joinFileTasks = []

	for (let i = 0; i < connection; i++) {

		joinFileTasks.push(cb => joinTask(i, downloadFileName, cb))
	}

	console.log('started joining files\'s parts:', downloadFileName)

	//remove file if existed before
	if (fs.existsSync(downloadFileName))
		fs.unlinkSync(downloadFileName)

	return async(joinFileTasks)
}

const joinTask = (i, downloadFileName, cb) => {
	
	const tmpName = md5(downloadFileName)

	let filename = path.resolve(__dirname, `tmp_${tmpName}/_file_${i}`)

	let tmpReadStream = fs.createReadStream(filename)

	const dest = fs.createWriteStream(downloadFileName, { 'flags': 'a' })

	tmpReadStream.pipe(dest)

	tmpReadStream.on('close', () => {

		cb()
	})
}



export default joinFiles