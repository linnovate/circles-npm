'use strict'

var middleware = require('./middlewares/acl');
module.exports = function(app, uri, settings) {
	if (app) {
		require('./routes')(app, uri, settings);
	}
	var circles = require('./controllers/circles')(uri, settings);

	return {
		acl: function() {
			return middleware(uri, settings);
		},
		upsertUser: function(id, callback) {
			return circles.upsertUser(id, callback);
		},
		sign: function(db, sources, circles, acl, callback) {
			return require('./helpers')({cacheDb:db}).sign(sources, circles, acl, callback);
		},
	}
}