# pgService

This is a small helper module to read the [PostgreSQL Connection Service File][doc_service].

## Install

```sh
npm install pgservice
  # or
npm instll hoegaarden/pgservice
```

## Usage

```js
var pgService = require('pgservice');

var conInfo = {
	'service' : 'my_service_name'
  , 'user' : 'some user'
  , '...' : '...'
};

pgService(conInfo, function(err, conInfo){
	if (err) {
    	// bail out or whatever
    }
    
    /*
     * conInfo has now additional fields read from
     * the appropriate Connection Service Files
     */
    console.log(conInfo);
});
```
## Synopsis

```js
pgService(conInfo, cb, env);
```

### `conInfo`

`conInfo` should be a hash with the desired connection settings. If this hash has a value for the key `service` the module tries to read the corresponding section from a [connection service file][doc_service].

### `cb(err, conInfo)`

The callback is called
  * on error
  * when the desired section is found
  * after all [connection service files][doc_service] have been read

If an appropriate section could be found all options from this section are added to `conInfo`, however: any setting which has already been set in `conInfo` doesn't get overwritten.

### `env`

If you want or need to you can pass in a hash of environment variables which are used for selecting the approprtiate file, the section name, ...
If no `env` gets passed `process.env` is uesd (you most likely don't want to pass in anything).

Following variables are potentialy read from the `env` (see also: [PostgreSQL Documentation][doc_env]):
  * `PGSERVICEFILE`
  * `PGSYSCONFDIR`
  * `PGSERVICE`
  * `HOME`
 


[doc_service]: http://www.postgresql.org/docs/current/static/libpq-pgservice.html
[doc_env]: http://www.postgresql.org/docs/9.3/static/libpq-envars.html
