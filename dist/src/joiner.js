'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var fs = require('fs');

var path = require('path');

var md5 = require('md5');

var Promise = require("bluebird");

var async = Promise.promisify(require('async').series);

var joinFiles = function joinFiles(downloadFileName, connection, length) {

	var joinFileTasks = [];

	var _loop = function _loop(i) {

		joinFileTasks.push(function (cb) {
			return joinTask(i, downloadFileName, cb);
		});
	};

	for (var i = 0; i < connection; i++) {
		_loop(i);
	}

	console.log('started joining files\'s parts:', downloadFileName);

	//remove file if existed before
	if (fs.existsSync(downloadFileName)) fs.unlinkSync(downloadFileName);

	return async(joinFileTasks);
};

var joinTask = function joinTask(i, downloadFileName, cb) {

	var tmpName = md5(downloadFileName);

	var filename = path.resolve(__dirname, 'tmp_' + tmpName + '/_file_' + i);

	var tmpReadStream = fs.createReadStream(filename);

	var dest = fs.createWriteStream(downloadFileName, { 'flags': 'a' });

	tmpReadStream.pipe(dest);

	tmpReadStream.on('close', function () {

		cb();
	});
};

exports.default = joinFiles;