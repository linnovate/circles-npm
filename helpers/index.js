'use strict';

var supportedDbs = ['mongoose', 'elasticsearch'];

module.exports = function(settings) {
	if (supportedDbs.indexOf(settings.cacheDb) > -1) {
		return (require(__dirname + '/' + settings.cacheDb)(settings));
	} else {
		throw 'Db ' + settings.cacheDb + ' not supported by circles.' 
	}
}