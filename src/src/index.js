import Downloader from './downloader'

var request = require('request-promise')

var fs = require('fs')

var path = require('path')

var md5 = require('md5')

import Joiner from './joiner'

let length = 0, uri = '', requestHeaders = null;

const createTmpDirIfNotExist = (tmpName) => {

	const tmpPath = path.resolve(__dirname, `tmp_${tmpName}`)

	if (!fs.existsSync(tmpPath)) {

		fs.mkdirSync(tmpPath)
	}
}

const download = (filename, connection) => {

	const tmpName = md5(filename)

	createTmpDirIfNotExist(tmpName)

	if (!length)
		return Promise.reject('File length is empty')

	connection = connection > 100 ? 100 : connection

	return Downloader({uri, headers: requestHeaders}, length, filename, connection)
				.then(() => Joiner(filename, connection))
				.then(() => {

					//check size
					var stats = fs.statSync(filename)

					if (stats.size !== length) {

						fs.unlinkSync(filename)
						return Promise.reject('File size is incorrect')
					}

					let dirPath = path.resolve(__dirname, `tmp_${tmpName}`)

					const files = fs.readdirSync(dirPath)

					for (let fname of files) {
						fs.unlinkSync(`${dirPath}/${fname}`)
					}

					fs.rmdir(dirPath)

					return true
				})
				.catch(err => console.log(err))

}

const checkPartialSupport = (uri, headers = {}) => {

	if (!headers || typeof headers !== 'object')
		headers = {}

	const options = {
		uri: uri,
		method: 'HEAD',
		headers: {
			Range: 'bytes=0-',
			...headers
		},
		resolveWithFullResponse: true
	}

	return request(options).then(res => {

		if (res.statusCode === 206)
			return res.headers['content-length']

		return false
	})
}


export default {
	getInfo,
	download
}