'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _downloader = require('./downloader');

var _downloader2 = _interopRequireDefault(_downloader);

var _joiner = require('./joiner');

var _joiner2 = _interopRequireDefault(_joiner);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var request = require('request-promise');

var fs = require('fs');

var path = require('path');

var md5 = require('md5');

var length = 0,
    uri = '',
    requestHeaders = null;

var createTmpDirIfNotExist = function createTmpDirIfNotExist(tmpName) {

	var tmpPath = path.resolve(__dirname, 'tmp_' + tmpName);

	if (!fs.existsSync(tmpPath)) {

		fs.mkdirSync(tmpPath);
	}
};

var download = function download(filename, connection) {

	var tmpName = md5(filename);

	createTmpDirIfNotExist(tmpName);

	if (!length) return Promise.reject('File length is empty');

	connection = connection > 100 ? 100 : connection;

	return (0, _downloader2.default)({ uri: uri, headers: requestHeaders }, length, filename, connection).then(function () {
		return (0, _joiner2.default)(filename, connection);
	}).then(function () {

		//check size
		var stats = fs.statSync(filename);

		if (stats.size !== length) {

			fs.unlinkSync(filename);
			return Promise.reject('File size is incorrect');
		}

		var dirPath = path.resolve(__dirname, 'tmp_' + tmpName);

		var files = fs.readdirSync(dirPath);

		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = files[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var fname = _step.value;

				fs.unlinkSync(dirPath + '/' + fname);
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}

		fs.rmdir(dirPath);

		return true;
	}).catch(function (err) {
		return console.log(err);
	});
};

var checkPartialSupport = function checkPartialSupport(uri) {
	var headers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


	if (!headers || (typeof headers === 'undefined' ? 'undefined' : _typeof(headers)) !== 'object') headers = {};

	var options = {
		uri: uri,
		method: 'HEAD',
		headers: _extends({
			Range: 'bytes=0-'
		}, headers),
		resolveWithFullResponse: true
	};

	return request(options).then(function (res) {

		if (res.statusCode === 206) return res.headers['content-length'];

		return false;
	});
};

exports.default = {
	getInfo: getInfo,
	download: download
};