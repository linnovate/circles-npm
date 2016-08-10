'use strict';

module.exports = function(app, uri, settings) {
  var circles = require('../controllers/circles')(uri, settings);

  app.route('/api/circles/mine').get(circles.mine);
  app.route('/api/circles/all').get(circles.all);
  app.route('/api/circles/sources').get(circles.sources);
}