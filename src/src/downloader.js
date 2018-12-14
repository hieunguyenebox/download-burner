
import request from 'request'
import fs from 'fs'
import path from 'path'
import { parallel } from 'async'
import md5 from 'md5'

const DownloadBuner = (requestConfig, length, downloadFileName, connection) => {

	const downloadLength = Math.ceil(length / connection)

	let from = 0, to = downloadLength

	var tasks = []

	for (let i = 0; i < connection; i++) {

		let end = to

		let start = from

		if (i === connection - 1)
			end = ''

		if (from >= length)
			return;

		const tmpName = md5(downloadFileName)

		// if start is 0, not plus 1, cause lost first byte
		tasks.push((cb) => downloadTask(requestConfig, start ? start + 1 : start, end, `tmp_${tmpName}/_file_${i}`, cb))

		from += downloadLength
		to += downloadLength

	}//end for

	if (tasks.length) {

		console.log('started downloading:', downloadFileName)
		return async(tasks)
	}
}


const downloadTask = ({uri, headers}, from, to, filename, cb) => {
	
	let options = {
			uri,
			headers: {
				Range: `bytes=${from}-${to}`,
				...headers
			}
		}

	let tmpWriteStream = fs.createWriteStream(path.resolve(__dirname, filename))

	tmpWriteStream.once('close', cb)

	request(options).pipe(tmpWriteStream)
}


export default DownloadBuner