'use strict';

require('../models/mongoCircle');
var _ = require('lodash'),
	mongoose = require('mongoose'),
	Circle = mongoose.model('CircleCache');

var Circles = {
	models: {}
};

module.exports = function(circleSettings) {

	return {
		getFromCache: function(key, date, callback) {
			Circle.findOne({
				key: key,
				created: {
					$gt: new Date(date.getTime() - 60000 * circleSettings.cacheTime)
				}
			}, function(err, circle) {
				return callback(circle);
			});
		},

		saveToCache: function(key, value, date) {
			Circle.findOneAndUpdate({
				key: key
			}, {
				key: key,
				value: value,
				created: date
			}, {
				upsert: true
			}, function() {})
		},

		query: function(model, circleTypes, userAllowed, userId) {
			if (!Circles.models[model]) {
				Circles.models[model] = mongoose.model(model);
			}
			var conditions = {
				$and: []
			};

			for (var type in circleTypes) {
				var allowed = {};
				if(userAllowed != 'no') 
					allowed = userAllowed[type].map(function(a) {
						return a._id;
					})
				else
					allowed = userAllowed;
				var c = buildConditions(type, circleTypes[type], allowed, userId);
				for (var i = 0 in c)
					if(c[i]) conditions.$and.push(c[i]);
				// conditions.$and.push(buildConditions(type, circleTypes[type], allowed, userId));
			}
			return Circles.models[model].where(conditions);
		},



		sign: function(sources, circles, acl, callback) {
			checkSource(sources, acl, circleSettings.circleTypes, function(error, sourceCircles) {
				if (error) return callback(error);
				else {
					circles = _.extend(circles, sourceCircles);
					checkPermissions(circles, acl, circleSettings.circleTypes, function(error) {
						if (error) return callback(error);
						else {
							return callback(null, circles)
						}
					});
				}
			});
		}
	}
}

function checkPermissions(circles, acl, circleTypes, callback) {

	if (!circles) return callback(null);
	for (var type in circleTypes) {
		if (circles[type] && !(circles[type] instanceof Array)) return callback('invalid circles permissions');
		if (circles[type] && circles[type].length) {
			if (circleTypes[type].max && (circles[type].length > circleTypes[type].max)) return callback('invalid circles permissions');
			if (circleTypes[type].requiredAllowed) {
				var allowed = acl.user.allowed[type].map(function(a) {
					return a._id;
				})
				for (var i = 0; i < circles[type].length; i++) {
					if (allowed.indexOf(circles[type][i]) < 0) {
						return callback('permissions denied');
					}
				}
			}
			if (circleTypes[type].requires) {
				for (var i = 0; i < circleTypes[type].requires.length; i++) {
					if (!circles[circleTypes[type].requires[i]] || !circles[circleTypes[type].requires[i]].length)
						return callback('missing requires permissions ' + circleTypes[type].requires[i]);
				}
			}
		}
	}

	return callback(null);
};

function checkSource(sources, acl, circleTypes, callback) {
	var sourcesCircles = {},
		source;

	for (var type in circleTypes) {
		if (circleTypes[type].sources) {
			sourcesCircles[type] = [];
		}
	}
	if (!sources || !sources.length) return callback(null, sourcesCircles);
	var mySources = {};
	for (var i = 0; i < acl.user.sources.length; i++) {
		mySources[acl.user.sources[i]._id.toString()] = acl.user.sources[i];
	}

	for (var i = 0; i < sources.length; i++) {

		source = mySources[sources[i].toString()]
		if (!source) return callback('permissions denied');
		if (!sourcesCircles[source.circleType]) sourcesCircles[source.circleType] = [];
		sourcesCircles[source.circleType].push(source.circle);
	}

	return callback(null, sourcesCircles);
};

var buildConditions = function(type, settings, allowed, userId) {
	var obj1 = {},
		obj2 = {},
		obj3 = {};

	if(allowed != 'no')	{
		obj1['circles.' + type] = {
			$in: allowed
		};
	}
	obj2['circles.' + type] = {
		$size: 0
	};
	obj3['circles.' + type] = {
		$exists: false
	};
	for(var i in settings.stronger){
		var s1 = {}, s2 ={};
		if ( allowed === 'no'){
			s1[settings.stronger[i]] = userId;
			var tmp =  s1;
		} else {
			s1[settings.stronger[i]] = userId;
			obj1 = {
				'$or': [obj1, s1]
			};
			s2[settings.stronger[i]] = {
				$size: 0
			};
			obj2 = {
				'$and': [obj2, s2]
			};
			obj3 = {
				'$and': [obj3, s2]
			};
		}
	}

	var data = (allowed !== 'no') ? [{'$or': [obj1, obj2, obj3]}] : [{'$or': [ obj2, obj3]}, tmp]
	
	return data;
};