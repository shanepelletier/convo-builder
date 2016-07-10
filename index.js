'use strict';

var app = require('express')();
var bodyParser = require('body-parser');
var async = require('async');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var twilioProvider = require('./providers/twilioProvider.js');
var messengerProvider = require('./providers/messengerProvider.js');

var providers = {
  twilio: undefined,
  messenger: undefined
}

// Exports the constructor
exports = module.exports = ConvoBuilder;

function ConvoBuilder(options) {
  // To allow usage of the module without 'new' keyword
  if (!(this instanceof ConvoBuilder)) {
    return new ConvoBuilder(options);
  }

  // options is optional so only process it if defined
  if (options !== undefined) {
    this.configure(options);
  }
}

exports.configure = function (options) {
  if (options === undefined) {
    throw new ReferenceError('options must be defined');
  }

  if (options.port === undefined) {
    throw new ReferenceError('options. port must be defined');
  }

  if (options.twilio !== undefined) {
    if (options.twilio.ACCOUNT_SID === undefined) {
      throw new ReferenceError('options.twilio.ACCOUNT_SID must be defined');
    }

    if (options.twilio.AUTH_TOKEN === undefined) {
      throw new ReferenceError('options.twilio.AUTH_TOKEN must be defined');
    }

    if (options.twilio.phoneNumber === undefined) {
      throw new ReferenceError('options.twilio.phoneNumber must be defined');
    }

    providers.twilio = twilioProvider(options.twilio.ACCOUNT_SID, options.twilio.AUTH_TOKEN, options.twilio.phoneNumber);
  } else {
    if (options.messenger.VERIFY_TOKEN === undefined) {
      throw new ReferenceError('options.messenger.VERIFY_TOKEN must be defined');
    }

    if (options.messenger.PAGE_ACCESS_TOKEN === undefined) {
      throw new ReferenceError('options.messenger.PAGE_ACCESS_TOKEN must be defined');
    }

    providers.messenger = messengerProvider(options.messenger.VERIFY_TOKEN, options.messenger.PAGE_ACCESS_TOKEN);
  }

  app.listen(options.port, function () {
    console.log('convo-builder listening on port ' + options.port);
  });
};

// TODO: add validateArgs function to validate the arguments for converse() and say()

exports.converse = function (messages) {
  // Next bunch of lines handle the optional options argument
  var options;
  var callback;
  var doneCallback;

  if (typeof arguments[1] === 'object') {
    options = arguments[1];
    callback = arguments[2];
    doneCallback = arguments[3];
  } else {
    // The default provider is twilio
    options = {provider: 'twilio'};
    callback = arguments[1];
    doneCallback = arguments[2];
  }

  if (!Array.isArray(messages)) {
    throw new TypeError(messages + ' is not an array');
  }

  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function');
  }

  // doneCallback is optional, so may be undefined
  if (typeof doneCallback !== 'undefined') {
    if (typeof doneCallback !== 'function') {
      throw new TypeError(doneCallback + ' is not a function');
    }
  }

  if (options.provider === undefined) {
    // First argument of callback is error
    return callback('Error: provider is required. Defaulting to twilio...');
    options.provider = 'twilio';
  }

  if (options.providerOptions === undefined) {
    return callback('Error: providerOptions is required');
  }

  // TODO: add support for twilio-voice and Facebook messenger
  if (options.provider !== 'twilio'       ||
      //options.provider !== 'twilio-voice' ||
    options.provider !== 'messenger') {
    return callback('Error: provider must be twilio. Defaulting to twilio...');
    options.provider = 'twilio';
  }

  console.log();
  console.log(messages);
  console.log();

  async.forEachOfSeries(messages, function (message, index, done) {
    console.log();
    console.log(message);
    console.log();
    if (providers[options.provider] !== undefined) {
      providers[options.provider].sendAndWaitForResponse(message, options.providerOptions, function (err, response) {
        callback(err, response, index);
        done();
      });
    } else {
      return callback('Error: provider must be configured before using');
      done();
    }
  }, function (err) {
    if (!err) {
      if (typeof doneCallback !== 'undefined') {
        doneCallback();
      }
    } else {
      return callback(err);
    }
  });
};

exports.say = function (message, options, callback) {
  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function');
  }

  if (options.provider === undefined) {
    return callback('Error: provider is required. Defaulting to twilio...');
    options.provider = 'twilio';
  }

  if (options.providerOptions === undefined) {
    return callback('Error: providerOptions is required');
  }

  if (options.provider !== 'twilio'    ||
    //options.provider !== 'twilio-voice ||'
      options.provider !== 'messenger') {
    return callback('Error: provider must be twilio. Defaulting to twilio...');
    options.provider = 'twilio';
  }

  providers[options.provider].send(message, options.providerOptions, function (err) {
    callback(false);
  });
};

// Handles incoming messages over HTTP
app.all('/', function (req, res) {
  // If the 'object' property of req.body is defined, the request should be handled by messengerProvider. Otherwise, it should be handled by twilioProvider.
  if (typeof req.body.object !== 'undefined') {
    providers['messenger'].receive(req, res);
  } else {
    providers['twilio'].receive(req, res);
});
