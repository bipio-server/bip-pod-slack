/**
 * @author Michael Pearson <github@m.bip.io>
 * Copyright (c) 2010-2014 Michael Pearson https://github.com/mjpearson
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
var util = require('util');

function PostMessage(podConfig) {
  this.name = 'post_message';
  this.description = 'Post to Channel',
  this.description_long = 'Posts a Message to a Channel',
  this.trigger = false;
  this.singleton = false;
  this.auto = false;
  this.podConfig = podConfig;
}

PostMessage.prototype = {};

// PostMessage schema definition
// @see http://json-schema.org/
PostMessage.prototype.getSchema = function() {
  return {
    "config": {
      "properties" : {
        "channel" : {
          "type" :  "string",
          "description" : "Channel ID",
          oneOf : [
            {
              '$ref' : '/renderers/channels_list#channels/{id}'
            }
          ],
          label : {
            '$ref' : '/renderers/channels_list#channels/{name}'
          }
        },
        "username" : {
          "type" :  "string",
          "description" : "Bot Name (optional)"
        }
      }
    },
    "imports": {
      "properties" : {
        "text" : {
          "type" :  "string",
          "description" : "Message Text"
        }
      }
    },
    "exports": {
      "properties" : {
        "ok" : {
          "type" : "boolean",
          "description" : "Response Status"
        }
      }
    }
  }
}

PostMessage.prototype.invoke = function(imports, channel, sysImports, contentParts, next) {
  if (imports.text) {
    var params = JSON.parse(JSON.stringify(imports));
    params.channel = channel.config.channel;
    if (channel.config.username) {
      params.username = channel.config.username;
    }

    this.pod.slackRequestParsed('chat.postMessage', params, sysImports, next);
  }
}

// -----------------------------------------------------------------------------
module.exports = PostMessage;