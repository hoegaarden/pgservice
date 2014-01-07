'use strict';

/* global describe: false */
/* global it: false */

/* jshint -W106 */
var COV = process.env.npm_lifecycle_event.indexOf('coverage') === 0;
/* jshint +W106 */

var assert = require('assert')
  , path = require('path')
  , pgService = require(path.join('..', COV ? 'lib-cov' : 'lib'))
  , fixPath = path.join(__dirname, 'fixtures')
  , fixUserFile = path.join(fixPath, '.pg_service.conf')
  , fixSysFile = path.join(fixPath, 'pg_service.conf')
;


describe('PgService (async)', function(){

    it('should not change conInfo if no service is defined in conInfo', function(done){
        var conInfo = {
            service : ''
        };
        pgService(conInfo, function(err, data){
            assert.ifError(err);
            assert.strictEqual(data.dbname, undefined);
            done();
        }, {});
    });

    it('should read from the users\' service file', function(done){
        var conInfo = {
            service : 'user'
        };
        var env = {
            HOME : fixPath ,
            PGSYSCONFDIR : fixPath
        };

        pgService(conInfo, function(err, data){
            assert.ifError(err);
            assert.strictEqual(data.dbname, 'seas');
            assert.strictEqual(data.user, 'some user');
            done();
        }, env);
    });

    it('should read the service file in PGSERVICEFILE', function(done){
        var conInfo = {
            service : 'user'
        };
        var env = {
            PGSERVICEFILE : fixUserFile ,
            PGSYSCONFDIR : fixPath
        };

        pgService(conInfo, function(err, data){
            assert.ifError(err);
            assert.strictEqual(data.dbname, 'seas');
            assert.strictEqual(data.user, 'some user');
            done();
        }, env);
    });

    it('should read the global service file as backup', function(done){
        var conInfo = {
            service : 'sys'
        };
        var env = {
            HOME : fixPath ,
            PGSYSCONFDIR : fixPath
        };

        pgService(conInfo, function(err, data){
            assert.ifError(err);
            assert.strictEqual(data.password, "me don't know");
            done();
        }, env);
    });

    it('should not complain if files do not exist', function(done){
        var conInfo = {
            service : 'user'
        };
        var env = {
            HOME : '/this should not exist' ,
            PGSYSCONFDIR : '/should not exist either'
        };

        pgService(conInfo, function(err, data){
            assert.ifError(err);
            assert.strictEqual(data.dbname, undefined);
            done();
        }, env);
    });

    it('should throw error if file is not readable', function(done){
        var conInfo = {
            service : 'user'
        };
        var env = {
            PGSERVICEFILE : path.join(fixPath, 'not_readable.conf')
        };
        pgService(conInfo, function(err, data){
            assert.strictEqual(err.code, 'EACCES');
            assert.strictEqual(err.path, env.PGSERVICEFILE);
            done();
        }, env);
    });
    
});



describe('PgService (sync)', function(){

    it('should not change conInfo if no service is defined in conInfo', function(){
        var conInfo = pgService({
            service : ''
        });
        assert.strictEqual(conInfo.dbname, undefined);
    });

    it('should read from the user\'s service file', function(){
        var conInfo = pgService({
            service : 'user'
        }, {
            HOME : fixPath ,
            PGSYSCONFDIR : fixPath
        });
        assert.strictEqual(conInfo.dbname, 'seas');
        assert.strictEqual(conInfo.user, 'some user');
    });

    it('should read the service file in PGSERVICEFILE', function(){
        var conInfo = pgService({
            service : 'user'
        }, {
            PGSERVICEFILE : fixUserFile ,
            PGSYSCONFDIR : fixPath
        });
        assert.strictEqual(conInfo.dbname, 'seas');
        assert.strictEqual(conInfo.user, 'some user');
    });

    it('should read the global service file as backup', function(){
        var conInfo = pgService({
            service : 'sys'
        }, {
            HOME : fixPath ,
            PGSYSCONFDIR : fixPath
        });
        assert.strictEqual(conInfo.password, "me don't know");
    });

    it('should not complain if files do not exist', function(){
        var conInfo = pgService({
            service : 'user'
        }, {
            HOME : '/this should not exist' ,
            PGSYSCONFDIR : '/should not exist either'
        });
        assert.strictEqual(conInfo.dbname, undefined);
    });

    it('should throw error if file is not readable', function(){
        assert.throws(function(){
            pgService({
                service : 'user'
            }, {
                PGSERVICEFILE : path.join(fixPath, 'not_readable.conf')
            });
        }, Error);
    });

});
