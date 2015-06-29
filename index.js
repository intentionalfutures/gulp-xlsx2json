'use strict';
var path = require('path');
var fs = require('graceful-fs');
var gutil = require('gulp-util');
var map = require('map-stream');
var filesize = require('filesize');
var tempWrite = require('temp-write');
var xlsx = require('xlsx');
var csv = require('csv');

module.exports = function (options) {
    return map(function (file, cb) {
        if (file.isNull()) {
            return cb(null, file);
        }

        if (file.isStream()) {
            return cb(new gutil.PluginError('gulp-xlsx2json', 'Streaming not supported'));
        }

        if (['.xlsx'].indexOf(path.extname(file.path)) === -1) {
            gutil.log('gulp-xlsx2json: Skipping unsupported xls ' + gutil.colors.blue(file.relative));
            return cb(null, file);
        }

        tempWrite(file.contents, path.extname(file.path), function (err, tempFile) {
            var record = [];
            var header = [];

            if (err) {
                return cb(new gutil.PluginError('gulp-xlsx2json', err));
            }

            fs.stat(tempFile, function (err, stats) {
                if (err) {
                    return cb(new gutil.PluginError('gulp-xlsx2json', err));
                }

                options = options || {};

                fs.readFile(tempFile, { encoding : 'UTF-8'}, function(err, data) {
                    if (err) {
                        return cb(new gutil.PluginError('gulp-xlsx2json', err));
                    }

                    var wb = xlsx.readFile(tempFile);
                    var wsCv = function(wb) {
                        var ws
                        var target_sheet = options.target_sheet || '';

                        if(target_sheet === '') 
                            target_sheet = wb.SheetNames[0];
                        ws = wb.Sheets[target_sheet];
                        return ws;
                    }

                    var ws_str = wsCv(wb)
                    var csv_str = xlsx.utils.make_csv(ws_str)

                    csv()
                        .from.string(csv_str)
                        .transform( function(row){
                          row.unshift(row.pop());
                          return row;
                        })
                        .on('record', function(row, index){
                          
                          if(index === 0) {
                            header = row;
                          }else{
                            var obj = {};
                            header.forEach(function(column, index) {
                              obj[column] = row[index];
                            })
                            record.push(obj);
                          }
                        })
                        .on('end', function(count){
                          // when writing to a file, use the 'close' event
                          // the 'end' event may fire before the file has been written
                            gutil.log('gulp-xlsx2json:', gutil.colors.green('✔ ') + file.relative); 
                            file.contents = new Buffer(JSON.stringify(record));
                            file.path = gutil.replaceExtension(file.path, '.json');
                            cb(null, file);
                          
                        })
                        .on('error', function(error){
                            console.log(error.message);
                        });                 
                
                });

            });
        });
    });
};
