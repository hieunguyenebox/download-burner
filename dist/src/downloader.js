'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _async = require('async');

var _md = require('md5');

var _md2 = _interopRequireDefault(_md);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DownloadBuner = function DownloadBuner(requestConfig, length, downloadFileName, connection) {

	var downloadLength = Math.ceil(length / connection);

	var from = 0,
	    to = downloadLength;

	var tasks = [];

	var _loop = function _loop(i) {

		var end = to;

		var start = from;

		if (i === connection - 1) end = '';

		if (from >= length) return {
				v: void 0
			};

		var tmpName = (0, _md2.default)(downloadFileName);

		// if start is 0, not plus 1, cause lost first byte
		tasks.push(function (cb) {
			return downloadTask(requestConfig, start ? start + 1 : start, end, 'tmp_' + tmpName + '/_file_' + i, cb);
		});

		from += downloadLength;
		to += downloadLength;
	};

	for (var i = 0; i < connection; i++) {
		var _ret = _loop(i);

		if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
	} //end for

	if (tasks.length) {

		console.log('started downloading:', downloadFileName);
		return async(tasks);
	}
};

var downloadTask = function downloadTask(_ref, from, to, filename, cb) {
	var uri = _ref.uri,
	    headers = _ref.headers;


	var options = {
		uri: uri,
		headers: _extends({
			Range: 'bytes=' + from + '-' + to
		}, headers)
	};

	var tmpWriteStream = _fs2.default.createWriteStream(_path2.default.resolve(__dirname, filename));

	tmpWriteStream.once('close', cb);

	(0, _request2.default)(options).pipe(tmpWriteStream);
};

exports.default = DownloadBuner;