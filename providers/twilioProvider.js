'use strict';

var twilio = require('twilio'); // For SMS messaging
var app = require('express')() // For setting up webhook for twilio

// Exports the constructor
exports = module.exports = TwilioProvider;

function TwilioProvider(ACCOUNT_SID, AUTH_TOKEN, phoneNumber) {

  // To allow usage of the module without 'new' keyword
  if (!(this instanceof TwilioProvider)) {
    return new TwilioProvider(ACCOUNT_SID, AUTH_TOKEN, phoneNumber);
  }

  this.config = {
    ACCOUNT_SID: ACCOUNT_SID,
    AUTH_TOKEN: AUTH_TOKEN,
    phoneNumber: phoneNumber
  }

  this.twilioClient = twilio(ACCOUNT_SID, AUTH_TOKEN);
}

TwilioProvider.prototype.send = function (message, options, callback) {
  if (typeof message === undefined) {
    throw new ReferenceError('message must be defined');
  }

  if (typeof options === undefined) {
    throw new ReferenceError('options must be defined');
  }

  if (typeof options.phoneNumber === undefined) {
    throw new ReferenceError('options.phoneNumber must be defined');
  }

  this.twilioClient.sendMessage({
    to: options.phoneNumber,
    from: this.config.phoneNumber,
    body: message
  }, function (err, responseData) {
    callback(false);
  });
};

TwilioProvider.prototype.sendAndWaitForResponse = function (message, options, callback) {
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

  if (typeof options.phoneNumber !== 'undefined') {

    this.twilioClient.sendMessage({
      to: options.phoneNumber,
      from: this.config.phoneNumber,
      body: message
    }, function (err, responseData) {
      if (!err) {
        console.log();
        console.log('Sent message');
        console.log();
        console.log(responseData);
        console.log();
      } else {
        console.log();
        console.log(err);
        console.log();
      }
    });

    /*this.redisClientSub.subscribe(options.phoneNumber);

    this.redisClientSub.on('message', function (channel, message) {
      console.log();
      console.log('The reply from the user is: ' + message);
      console.log();
      return callback(false, message);
    });
    */
  } else {
    throw new ReferenceError('options.phoneNumber must be defined');
  }
};

TwilioProvider.prototype.receive = function (req, res) {
  var resp = new twilio.TwimlResponse();
  console.log(req.body);

  if (typeof this.receivedCallback === 'function') {
    this.receivedCallback(false, req.body.Body);
  } else {
    // TODO: allow middleware handling of inbound messages that aren't part of a conversation
  }

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(resp.toString());
};
