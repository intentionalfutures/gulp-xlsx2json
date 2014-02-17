'use strict';
var fs = require('fs');
var assert = require('assert');
var gutil = require('gulp-util');
var xlsx2json= require('./index');

it('should convert xlsx to json', function (cb) {
	var stream = xlsx2json();
	stream.on('data', function (file) {
    var parse_str = JSON.parse(file.contents.toString('utf-8'));
		assert(parse_str instanceof Object);
		cb();
	});

	stream.write(new gutil.File({
		path: __dirname + '/sample/sample-xlsx.xlsx',
		contents: fs.readFileSync(__dirname + '/sample/sample-xlsx.xlsx')
	}));
});
