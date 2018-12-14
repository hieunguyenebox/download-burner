'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.download = exports.FlashGetter = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _md = require('md5');

var _md2 = _interopRequireDefault(_md);

var _nanoid = require('nanoid');

var _nanoid2 = _interopRequireDefault(_nanoid);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _util = require('util');

require('babel-polyfill');

var _child_process = require('child_process');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var parallel = (0, _util.promisify)(_async2.default.parallel),
    series = (0, _util.promisify)(_async2.default.series);

var mkdir = function mkdir(pathDir) {

	return new Promise(function (resolve, reject) {

		(0, _child_process.exec)('mkdir -p ' + pathDir, function (err, stdout, stderr) {

			if (err) reject('Cannot create on ' + pathDir);

			resolve();
		});
	});
};

var FlashGetter = exports.FlashGetter = function () {
	function FlashGetter() {
		var _this = this;

		_classCallCheck(this, FlashGetter);

		this.tmpDir = '';
		this.uri = '';
		this.opts = {};
		this.partial = false;
		this.uriValid = false;

		this.appendHeaders = function (headers) {

			var opts = _this.opts;

			headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36';

			if (opts && (typeof opts === 'undefined' ? 'undefined' : _typeof(opts)) === 'object') {
				var userConfigHeaders = opts.headers;


				headers = _extends({}, userConfigHeaders, headers);
			}

			return headers;
		};

		this.createDownloadTask = function (from, length, filename, cb) {

			var options = {
				uri: _this.uri,
				headers: {
					Range: 'bytes=' + from + '-' + (from + length)
				}
			};

			options.headers = _this.appendHeaders(options.headers);

			var tmpWriteStream = _fs2.default.createWriteStream(_this.tmpDir + '/' + filename);

			tmpWriteStream.once('close', function () {

				cb(null, _this.tmpDir + '/' + filename);
			});

			(0, _requestPromise2.default)(options).pipe(tmpWriteStream);
		};

		this.createTmpDir = function () {

			_this.tmpDir = _path2.default.resolve(process.cwd(), 'tmp/' + (0, _md2.default)((0, _nanoid2.default)(12)));

			return mkdir(_this.tmpDir);
		};

		this.download = function () {
			var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(uri, opts) {
				return regeneratorRuntime.wrap(function _callee$(_context) {
					while (1) {
						switch (_context.prev = _context.next) {
							case 0:

								_this.opts = opts || {};
								_this.uri = uri;

								_context.next = 4;
								return _this.getURIInfo();

							case 4:
								if (!_this.uriValid) {
									_context.next = 8;
									break;
								}

								return _context.abrupt('return', _this.process());

							case 8:
								return _context.abrupt('return', Promise.reject('Cannot get the file. Please check url.'));

							case 9:
							case 'end':
								return _context.stop();
						}
					}
				}, _callee, _this);
			}));

			return function (_x, _x2) {
				return _ref.apply(this, arguments);
			};
		}();

		this.getNewFileName = function () {
			var newName = _this.opts.newName;


			if (!newName) newName = _this.uri.split('/').pop();

			return newName.replace(/[\\\/]+/, '_');
		};

		this.getDestPath = function () {
			var _opts$dest = _this.opts.dest,
			    dest = _opts$dest === undefined ? '' : _opts$dest;


			if (dest) {

				if (dest.indexOf('/') !== 0) dest = _path2.default.resolve(process.cwd(), dest);else dest = _path2.default.resolve(dest, '');
			} else {

				dest = _path2.default.resolve(process.cwd(), '');
			}

			return dest;
		};

		this.createDest = function (dest) {

			return new Promise(function (resolve, reject) {

				mkdir(dest);
			});
		};

		this.startDownloading = function (dest) {

			return new Promise(function (resolve, reject) {

				console.log('Downloading "' + _this.uri + '"...');

				var writeStream = _fs2.default.createWriteStream(dest);

				(0, _requestPromise2.default)(_this.uri).pipe(writeStream);

				writeStream.on('finish', function () {
					return resolve('File has been downloaded');
				}).on('error', function () {
					return reject('Error to write file to disk');
				});
			});
		};

		this.downloadSingle = function () {

			var newName = _this.getNewFileName(),
			    dest = _this.getDestPath();

			var destFile = dest + '/' + newName;

			if (!_fs2.default.existsSync(dest)) {

				return _this.createDest(dest).then(function () {
					return _this.startDownloading(destFile);
				});
			}

			return _this.startDownloading(destFile);
		};

		this.getConnectionNumber = function () {
			var connection = _this.opts.connection;


			if (isNaN(connection) || connection > 30 || connection < 1) connection = 30;

			return connection;
		};

		this.createPartialDownloadTasks = function () {

			var connNumber = _this.getConnectionNumber(),
			    partialLength = Math.ceil(_this.contentLength / connNumber),
			    tasks = [];

			var _loop = function _loop(i) {

				// if start is 0, not plus 1, cause lost first byte
				tasks.push(function (cb) {

					_this.createDownloadTask(i ? i * partialLength + i : 0, i === connNumber - 1 ? '' : partialLength, (0, _md2.default)('file_' + i), cb);
				});
			};

			for (var i = 0; i < connNumber; i++) {
				_loop(i);
			}

			return tasks;
		};

		this.createAppendTask = function (writeStream, filename, cb) {

			var readStream = _fs2.default.createReadStream(filename);

			readStream.pipe(writeStream);

			readStream.on('finish', function () {

				_fs2.default.unlink(filename, function (err) {

					cb();
				});
			});
		};

		this.createJoinTasks = function (files, writeStream) {

			return files.map(function (file) {
				return function (cb) {
					return _this.createAppendTask(writeStream, file, cb);
				};
			});
		};

		this.joinFiles = function (files) {

			var file = _this.getNewFileName(),
			    dest = _this.getDestPath();

			var destFile = dest + '/' + newName;

			var writeStream = _fs2.default.createWriteStream(destFile);

			var tasks = _this.createJoinTasks(files, writeStream);

			return series(tasks).then(function () {

				_fs2.default.unlink(_this.tmpDir, function () {});
			});
		};

		this.downloadPartials = function () {

			var tasks = _this.createPartialDownloadTasks();

			console.log('Downloading "' + _this.uri + '"...');

			return parallel(tasks).then(_this.joinFiles);
		};

		this.getURIInfo = function () {

			console.log('Checking "' + _this.uri + '"....');

			var opts = {
				uri: _this.uri,
				method: 'HEAD',
				headers: { Range: 'bytes=0-' },
				resolveWithFullResponse: true,
				simple: false
			};

			opts.headers = _this.appendHeaders(opts.headers);

			return (0, _requestPromise2.default)(opts).then(function (res) {

				if (res.headers['accept-ranges'].includes('bytes')) {

					_this.partial = true;
					_this.uriValid = true;
					_this.contentLength = res.headers['content-length'];
				} else {

					_this.uriValid = true;
				}
			});
		};
	}

	_createClass(FlashGetter, [{
		key: 'process',
		value: function () {
			var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
				return regeneratorRuntime.wrap(function _callee2$(_context2) {
					while (1) {
						switch (_context2.prev = _context2.next) {
							case 0:
								if (!this.partial) {
									_context2.next = 4;
									break;
								}

								return _context2.abrupt('return', this.createTmpDir().then(this.downloadPartials));

							case 4:
								return _context2.abrupt('return', this.downloadSingle());

							case 5:
							case 'end':
								return _context2.stop();
						}
					}
				}, _callee2, this);
			}));

			function process() {
				return _ref2.apply(this, arguments);
			}

			return process;
		}()
	}]);

	return FlashGetter;
}();

var download = exports.download = function download(uri, opts) {

	return new FlashGetter().download(uri, opts);
};

exports.default = download;

// const download = (filename, connection) => {

// 	const tmpName = 

// 	createTmpDir(tmpName)

// 	if (!length)
// 		return Promise.reject('File length is empty')

// 	connection = connection > 50 ? 50 : connection

// 	return Downloader({uri, headers: requestHeaders}, length, filename, connection)
// 				.then(() => Joiner(filename, connection))
// 				.then(() => {

// 					//check size
// 					var stats = fs.statSync(filename)

// 					if (stats.size !== length) {

// 						fs.unlinkSync(filename)
// 						return Promise.reject('File size is incorrect')
// 					}

// 					let dirPath = path.resolve(__dirname, `tmp_${tmpName}`)

// 					const files = fs.readdirSync(dirPath)

// 					for (let fname of files) {
// 						fs.unlinkSync(`${dirPath}/${fname}`)
// 					}

// 					fs.rmdir(dirPath)

// 					return true
// 				})
// 				.catch(err => console.log(err))

// }