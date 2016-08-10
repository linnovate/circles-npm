'use strict';

var request = require('request'),
  qs = require('querystring');

module.exports = function(uri, settings) {
  var helpers = require('../helpers')(settings)
  var self = {
    getCircles: function(type, user, callback) {
      var query = qs.stringify({
        user: user
      });
      var api = '/api/v1/circles/' + type + '?' + query;
      var date = new Date();
      helpers.getFromCache(api, date, function(circle) {
        if (circle) return callback(null, circle.value);
        request(uri + api, function(error, response, body) {
          if (error || response.statusCode !== 200) return callback(error || response.statusCode);
          helpers.saveToCache(api, body, date);
          return callback(null, body);
        });
      })
    },
    all: function(req, res, next) {
      self.getCircles('all', req.user.id, function(err, data) {
        return res.send(data);
      })
    },

    sources: function(req, res, next) {
      self.getCircles('sources', req.user.id, function(err, data) {
        return res.send(data);
      })
    },

    mine: function(req, res, next) {
      self.getCircles('mine', req.user.id, function(err, data) {
        return res.send(data);
      })
    },

    upsertUser: function(id, callback) {
      var api = '/api/v1/users/' + id;
      request.post(uri + api, function(error, response, body) {
        callback(response);
      });
    }
  }
  return self;
};