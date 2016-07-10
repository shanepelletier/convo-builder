'use strict';

var request = require('request');

// Exports the constructor
exports = module.exports = MessengerProvider;

function MessengerProvider(VERIFY_TOKEN, PAGE_ACCESS_TOKEN) {

  // To allow usage of the module without 'new' keyword
  if (!(this instanceof MessengerProvider)) {
    return new MessengerProvider(VERIFY_TOKEN, PAGE_ACCESS_TOKEN);
  }

  this.config = {
    VERIFY_TOKEN: VERIFY_TOKEN,
    PAGE_ACCESS_TOKEN: PAGE_ACCESS_TOKEN
  }
}

MessengerProvider.prototype.send = function (message, options, callback) {
  if (typeof message === undefined) {
    throw new ReferenceError('message must be defined');
  }

  if (typeof options === undefined) {
    throw new ReferenceError('options must be defined');
  }

  if (typeof options.recipientId === undefined) {
    throw new ReferenceError('options.recipientId must be defined');
  }

  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: message
    }
  };

  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: config.PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData
  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      callback(false);
    }
  });
};

MessengerProvider.prototype.sendAndWaitForResponse = function (message, options, callback) {
  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function');
  }

  this.receivedCallback = callback;

  if (typeof message === undefined) {
    throw new ReferenceError('message must be defined');
  }

  if (typeof options === undefined) {
    throw new ReferenceError('options must be defined');
  }

  if (typeof options.recipientId !== 'undefined') {

    var messageData = {
      recipient: {
        id: options.recipientId
      },
      message: {
        text: message
      }
    };

    request({
      uri: 'https://graph.facebook.com/v2.6/me/messages',
      qs: { access_token: config.PAGE_ACCESS_TOKEN },
      method: 'POST',
      json: messageData
    }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        callback(false);
      }
    });
  } else {
    throw new ReferenceError('options.phoneNumber must be defined');
  }
};

MessengerProvider.prototype.receive = function (req, res) {
  // Messenger expects to be able to send a GET request to the webhook for verification
  if (req.method === 'GET') {
    if (req.query['hub.verify_token'] === this.config.VERIFY_TOKEN) {
      res.send(req.query['hub.challenge']);
    } else {
      res.send('Error, wrong validation token');
    }
  } else if (req.method === 'POST') {
    for (var i = 0; i < req.body.entry.length; i++) {
      var entry = req.body.entry[i];
      if (typeof this.receivedCallback === 'function') {
        for (var j = 0; j < entry.messaging.length; j++) {
          var message = entry.messaging[i];
          this.receivedCallback(false, message);
        }
      } else {
        // TODO: allow middleware handling of inbound messages that aren't part of a conversation
      }
    }
  }

  res.status(200);
  res.end();
};
