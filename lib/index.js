'use strict';

var ini = require('node-ini')
  , path = require('path')
  , async = require('async')
  , fs = require('fs')
;

function PgService(conInfo, cb, env) {

    env = env || process.env;

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
    }

    var service = env.PGSERVICE || conInfo.service;

    if (!service) {
        cb(null, conInfo);
        return this;
    }

    var files = getFiles();
    var found = false;

    async.doUntil(
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

    return this;
}

module.exports = PgService;