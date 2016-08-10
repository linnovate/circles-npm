# circles-npm
Node sdk for https://github.com/linnovate/circles

# Overview
The circles npm provides several features that work together with the circles api to provide \
organizational context to users and to enforce compermentalization of data (the ability to seclude permissions between types of users).
When you use circles you can "sign" the data with it's appropriate circle (which represents who can consume it).
A user can pull his "Circles" which basically communicate to what groups he belongs and what type of data can he consume.
The circles npm provides
* The function to "sign" an object with it's circles
* The express middleware to add to your routes so they will allow or disallow access to content based on the circles signed on the content and sent to the api query.
* Access and helper functions to the circles api (getCircles, )


# Configuration
Your app should reference a circlesApi instance and should have an (express style) config setting for 
circles api...
```
circles: {
    uri: 'http://localhost:3005'
  },
```

the circleSettings configuration could typically be set like this...
```
'use strict';

module.exports = {
	displayAllSources: false,
	displayAllC19nGroups: false,
	displayAllGroups: false,
	circleTypes: {
		c19n: {
			requiredAllowed: true,
			max: 1,
			sources: true
		},
		c19nGroups1: {
			requiredAllowed: true,
			max: 1,
			requires: ['c19n']
		},
		c19nGroups2: {
			requiredAllowed: true,
			max: 1,
			requires: ['c19n']
		},
		personal: {
			requiredAllowed: false,
			max: 50,
			watchers: true
		}
	},
	cacheTime: 5,
	cacheDb: 'mongoose'
};
```
# Usage
```
var circles = require('circles-npm')(app, config.circles.uri, circleSettings);
```

## Signing data
```
circlesAcl.sign('mongoose', entity.sources, entity.circles, acl, function(error, circles) {}
```

## Middleware
```  
app.route('/api/:entity(tasks|discussions|projects|users|circles)*').all(circles.acl());
```