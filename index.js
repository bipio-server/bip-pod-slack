/**
 * @author Michael Pearson <michael@cloudspark.com.au>
 * Copyright (c) 2010-2014 CloudSpark pty ltd http://www.cloudspark.com.au
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
var Pod = require('bip-pod'),
  qs = require('querystring'),
  https = require('https'),
Slack = new Pod({
  name : 'slack',
  description : 'Slack',
  description_long : '<a href="https://slack.com">Slack</a> brings all your communication together in one place. It\'s real-time messaging, archiving and search for modern teams.',
  authType : 'oauth',
  passportStrategy : require('passport-slack').Strategy,
  config : {
    "oauth": {
      "clientID" : "",
      "clientSecret" : "",
      "scopes" : [
      "identify",
      "read",
      "post"
      ]
    }
  },
  'renderers' : {
    'channels_list' : {
      description : 'Get Channels',
      contentType : DEFS.CONTENTTYPE_JSON
    }
  }
});

Slack.getParameters = function(path, query, sysImports) {
  var auth = {
    token : sysImports.auth.oauth.token
  };

  return '/api/'
  + path
  + '?'
  + qs.stringify(auth)
  + '&'
  + qs.stringify(query);
}

Slack.slackRequest = function(path, params, sysImports, next, method) {
  var opts = {
    host: 'slack.com',
    port: 443,
    path: this.getParameters(path, params, sysImports),
    method: method || 'GET'
  };
  https.request(opts, next).end();
}

Slack.slackRequestParsed = function(path, params, sysImports, next, method) {
  this.slackRequest(path, params, sysImports, function(res) {
    res.setEncoding('utf8');
    var data = "";
    res.on('data', function(d) {
      data += d;
    });
    res.on("end", function() {

      if(res.statusCode !== 200) {
        next(data);
      } else {
        try {
          var parsedBody = JSON.parse(data);
          if (!parsedBody.ok) {
            next(parsedBody.error, parsedBody);
          } else {
            next(false, parsedBody);
          }
        } catch (e) {
          next(e.message);
        }
      }
    });
  }, method);
}

Slack.rpc = function(action, method, sysImports, options, channel, req, res) {
  var pod = this.pod;
  
  if (method == 'channels_list') {
    this.slackRequest(
      'channels.list',
      {},
      sysImports,
      function(tRes) {
        tRes.pipe(res);
      }
    );
  } else {
    this.__proto__.rpc.apply(this, arguments);
  }
}

// Include any actions
Slack.add(require('./postmessage.js'));

// -----------------------------------------------------------------------------
module.exports = Slack;
