'use strict';

var ini = require('node-ini')
  , path = require('path')
  , fs = require('fs')
;

function PgService(conInfo, cb, env) {
    var sync = false;

    if (typeof cb !== 'function') {
        env = cb;
        sync = true;
    }

    env = env || process.env;
    var service = env.PGSERVICE || conInfo.service;

    // early return if no need to read service config file(s)
    if (!service) {
        return sync ? conInfo : cb(null, conInfo);
    }

    return sync ? doSync() : doAsync();


    function getFiles() {
        return [
            env.PGSERVICEFILE || path.join( env.HOME , '.pg_service.conf' ) ,
            path.join( env.PGSYSCONFDIR || '/etc' , 'pg_service.conf' )
        ];
    }

    function addToConInfo(data) {
        Object.keys(data || {}).forEach(function(key){
            var val = data[key];
            var override = !(
                conInfo[key] || conInfo[key] === ''
            );

            if (override) {
                conInfo[key] = val;
            }
        });
        return conInfo;
    }


    function doSync() {
        var files = getFiles().filter(fs.existsSync);
        var file;

        while ( (file = files.shift()) ) {
            var data = ini.parseSync(file);
            if (data.hasOwnProperty(service)) {
                return addToConInfo(data[service]);
            }
        }

        return conInfo;
    } // doSync()

    
    function doAsync() {
        var files = getFiles();
        var found = false;

        require('async').doUntil(
            function iterator(done) {
                var file = files.shift();
                fs.exists(file, function(exists){
                    if (!exists) {
                        return done();
                    }
                    ini.parse(file, function(err, data){
                        if (err) {
                            return done(err);
                        }

                        if (data.hasOwnProperty(service)) {
                            addToConInfo(data[service]);
                            found = true;
                        }

                        done();
                    });
                });
            } ,
            function test() {
                return (
                    (found === true) || (files.length < 1)
                );
            } ,
            function done(err) {
                return err ? cb(err) : cb(null, conInfo);
            }
        );
    } // doAsync()

}


module.exports = PgService;