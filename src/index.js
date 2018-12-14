
import request from 'request-promise'
import fs from 'fs'
import path from 'path'
import Joiner from './joiner'
import md5 from 'md5'
import nanoid from 'nanoid'
import { parallel } from 'async'

class FlashGetter {

	tmpDir = path.resolve(__dirname, md5(nanoid(12)))

	appendHeaders = opts => {

		if (this.opts.headers && typeof this.opts.headers === 'object')
			opts.headers = {...this.opts.headers, ...opts.headers}

		return opts
	}

	createDownloadTask = (from, length, filename, cb) => {
		
		let options = {
			this.uri,
			headers: {
				Range: `bytes=${from}-${length}`,
			}
		}

		options = this.appendHeaders(options)

		const tmpWriteStream = fs.createWriteStream(this.tmpDir, filename)

		tmpWriteStream.once('close', cb)
		request(options).pipe(tmpWriteStream)
	}

	download = () => {

		const downloadLength = Math.ceil(length / connection)

		let from = 0, to = downloadLength

		var tasks = []

		for (let i = 0; i < connection; i++) {

			let end = to, start = from

			if (i === connection - 1)
				end = ''

			if (from >= length)
				return;

			// if start is 0, not plus 1, cause lost first byte
			tasks.push((cb) => {

				downloadTask(
					start ? start + 1 : start,
					end,
					md5(`file_${i}`),
					cb
				)
			})

			from += downloadLength
			to += downloadLength

		}//end for

		if (tasks.length) {

			console.log('started downloading:', downloadFileName)
			parallel(tasks)
		}
	}

	getContentLength = () => {

		const opts = {
			uri: uri,
			method: 'HEAD',
			headers: {
				Range: 'bytes=0-',
			},
			resolveWithFullResponse: true
		}

		if (this.opts.headers && typeof this.opts.headers === 'object')
			opts.headers = {...this.opts.headers, ...opts.headers}

		request(opts).then(res => {

			if (res.statusCode === 206)
				this.contentLength = res.headers['content-length']
			else
				this.contentLength = 0

		})
	}

	get (uri, opts) {

		this.opts = opts
		this.uri = uri

	}
}


const download = (filename, connection) => {

	const tmpName = 

	createTmpDir(tmpName)

	if (!length)
		return Promise.reject('File length is empty')

	connection = connection > 50 ? 50 : connection

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

export default {
	getInfo,
	download
}