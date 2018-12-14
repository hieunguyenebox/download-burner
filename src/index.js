
import request from 'request-promise'
import fs from 'fs'
import path from 'path'
import md5 from 'md5'
import nanoid from 'nanoid'
import async from 'async'
import { promisify } from 'util'
import 'babel-polyfill'
import { exec } from 'child_process'

const parallel = promisify(async.parallel)
	, series = promisify(async.series)

const mkdir = pathDir => {

	return new Promise((resolve, reject) => {

		exec(`mkdir -p ${pathDir}`, (err,stdout,stderr) => {

			if (err) reject(`Cannot create on ${pathDir}`)

			resolve()
		})
	})
}

export class FlashGetter {

	tmpDir = ''
	uri = ''
	opts = {}
	partial = false
	uriValid = false

	appendHeaders = headers => {

		const opts = this.opts

		headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36'

		if (opts && typeof opts === 'object') {

			const { headers: userConfigHeaders } = opts

			headers = {...userConfigHeaders, ...headers}
		}

		return headers
	}

	createDownloadTask = (from, length, filename, cb) => {
		
		const options = {
			uri: this.uri,
			headers: {
				Range: `bytes=${from}-${from + length}`,
			}
		}

		options.headers = this.appendHeaders(options.headers)

		const tmpWriteStream = fs.createWriteStream(`${this.tmpDir}/${filename}`)

		tmpWriteStream.once('close', () => {

			cb(null, `${this.tmpDir}/${filename}`)
		})

		request(options).pipe(tmpWriteStream)
	}

	createTmpDir = () => {

		this.tmpDir = path.resolve(process.cwd(), `tmp/${md5(nanoid(12))}`)

		return mkdir(this.tmpDir)
	}

	download = async (uri, opts) => {

		this.opts = opts || {}
		this.uri = uri

		await this.getURIInfo()

		if (this.uriValid)
			return this.process()
		else
			return Promise.reject('Cannot get the file. Please check url.')

	}

	async process () {

		if (this.partial) {

			return this.createTmpDir().then(this.downloadPartials)

		} else {

			return this.downloadSingle()
		}
	}

	getNewFileName = () => {

		let { newName } = this.opts

		if (!newName)
			newName = this.uri.split('/').pop()

		return newName.replace(/[\\\/]+/, '_')
	}

	getDestPath = () => {

		let { dest = '' } = this.opts

		if (dest) {

			if (dest.indexOf('/') !== 0)
				dest = path.resolve(process.cwd(), dest)
			else
				dest = path.resolve(dest, '')

		} else {

			dest = path.resolve(process.cwd(), '')
		}

		return dest
	}


	createDest = (dest) => {

		return new Promise((resolve, reject) => {

			mkdir(dest)
		})
	}

	startDownloading = (dest) => {

		return new Promise((resolve, reject) => {

			console.log(`Downloading "${this.uri}"...`)

			const writeStream = fs.createWriteStream(dest)

			request(this.uri).pipe(writeStream)

			writeStream
				.on('finish', () => resolve('File has been downloaded'))
				.on('error', () => reject('Error to write file to disk'))
		})
	}

	downloadSingle = () => {

		const newName = this.getNewFileName()
			, dest = this.getDestPath();

		const destFile = `${dest}/${newName}`

		if (!fs.existsSync(dest)) {

			return this.createDest(dest).then(() => this.startDownloading(destFile))
		}

		return this.startDownloading(destFile)
	}

	getConnectionNumber = () => {

		let { connection } = this.opts

		if (isNaN(connection) || connection > 30 || connection < 1)
			connection = 30

		return connection
	}

	createPartialDownloadTasks = () => {

		const connNumber = this.getConnectionNumber()
			, partialLength = Math.ceil(this.contentLength / connNumber)
			, tasks = [];

		for (let i = 0; i < connNumber; i++) {

			// if start is 0, not plus 1, cause lost first byte
			tasks.push((cb) => {

				this.createDownloadTask(
					i ? (i * partialLength) + i : 0,
					i === connNumber - 1 ? '' : partialLength,
					md5(`file_${i}`),
					cb
				)
			})
		}

		return tasks
	}


	createAppendTask = (writeStream, filename, cb) => {

		const readStream = fs.createReadStream(filename)

		readStream.pipe(writeStream)

		readStream.on('finish', () => {

			fs.unlink(filename, err => {

				cb()
			})
		})
	}

	createJoinTasks = (files, writeStream) => {

		return files.map(file => cb => this.createAppendTask(writeStream, file, cb))
	}

	joinFiles = files => {
		
		const file = this.getNewFileName()
			, dest = this.getDestPath();

		const destFile = `${dest}/${newName}`

		const writeStream = fs.createWriteStream(destFile);

		const tasks = this.createJoinTasks(files, writeStream)

		return series(tasks).then(() => {

			fs.unlink(this.tmpDir, () => {})
		})
	}

	downloadPartials = () => {

		const tasks = this.createPartialDownloadTasks()

		console.log(`Downloading "${this.uri}"...`)

		return parallel(tasks).then(this.joinFiles)
	}

	getURIInfo = () => {

		console.log(`Checking "${this.uri}"....`)

		const opts = {
			uri: this.uri,
			method: 'HEAD',
			headers: { Range: 'bytes=0-'},
			resolveWithFullResponse: true,
			simple: false
		}

		opts.headers = this.appendHeaders(opts.headers)
		
		return request(opts).then(res => {

			if (res.headers['accept-ranges'].includes('bytes')) {

				this.partial = true
				this.uriValid = true
				this.contentLength = res.headers['content-length']

			} else {

				this.uriValid = true
			}
		})
	}
}

export const download = (uri, opts) => {

	return (new FlashGetter).download(uri, opts)
}

export default download

