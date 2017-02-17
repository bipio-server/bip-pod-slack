/**
 * Copyright (c) 2017 InterDigital, Inc. All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Pod = require('bip-pod'),
  qs = require('querystring'),
  https = require('https'),
  Slack = new Pod();

Slack.profileReprOAuth = function(profile) {
  return profile.user + ' - ' + profile.team;
}

Slack.getParameters = function(path, query, sysImports) {
  var auth = {
    token : sysImports.auth.oauth.access_token
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

// -----------------------------------------------------------------------------
module.exports = Slack;
