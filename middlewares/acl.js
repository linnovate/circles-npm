'use strict';

module.exports = function(uri, settings) {
	var circles = require('../controllers/circles')(uri, settings);

	return function(req, res, next) {
		req.acl = {};
		circles.getCircles('mine', req.user.id, function(err, data) {
			if (err) {
				req.acl.error = err;
				return next();
			}
			req.acl.user = JSON.parse(data);
			req.acl.mongoQuery = function(model) {
				return require('../helpers')(settings).query(model, settings.circleTypes, req.acl.user.allowed, req.user._id);
			};

			req.acl.elasticsearchQuery = function(model) {
				return require('../helpers')(settings).query(model, settings.circleTypes, req.acl.user.allowed, req.user._id);
			};

			next();

		});
	};
};