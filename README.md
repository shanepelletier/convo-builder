# convo-builder
 Easily build conversations for Twilio, Facebook Messenger, and more.

## Installation
Via NPM:
```bash
npm install convo-builder
```

You can also check out convo-builder directly from Git:
```bash
git clone https://github.com/shanepelletier/convo-builder.git
```

After cloning the Git repository, you have to install the node dependencies. Navigate to the root of your cloned repository and use npm to install all necessary dependencies.
```bash
npm install
```

## Example
```javascript
var convo = require('convo-builder');

convo.configure({
  port: 8145,
  twilio: {
    ACCOUNT_SID: '<YOUR_ACCOUNT_SID>',
    AUTH_TOKEN: '<YOUR_AUTH_TOKEN>',
    phoneNumber: '<YOUR_TWILIO_PHONE_NUMBER>'
  }
});

var greeting = 'Hi! Here\'s a survey your coach wanted me to send you.';

var messages = [
  'Did you eat cake at least once this week?',
  'What one food would you most like to eat next week?',
  'On a scale from 1 to 5, how happy were you with this week\'s meal plan?'
];

var conclusion = 'Thanks for answering my questions! Enjoy the rest of your day.';

var options = {
  provider: 'twilio',
  providerOptions: {
    phoneNumber: '<THE PHONE NUMBER YOU WISH TO MESSAGE>'
  }
};
  
convo.say(greeting, options, function (err) {
  convo.converse(messages, options, function (err, response, message) {
    if (!err) {
    console.log('The user\'s response to the message "' + message + '" was: ' + response);
    } else {
      console.log('An error occurred:');
      console.log(err);
    }
  }, function () {
    convo.say(conclusion, options, function (err) {
      console.log('The conversation has finished.');
    });
  });
});
```

## Methods
```javascript
convo.configure(configOptions)
```
Takes an object that is used to configure convo-builder and the providers.

Available options:
```javascript
{
  port: <Port number to listen for messages on>
  twilio: {
    ACCOUNT_SID: '<Twilio account SID>',
    AUTH_TOKEN: '<Twilio auth token>',
    phoneNumber: '<Twilio phone number>'
  },
  messenger: {
    VERIFY_TOKEN: '<Verify token for Facebook messenger>',
    PAGE_ACCESS_TOKEN: '<Page access token for Facebook messenger>'
  }
}
```

```javascript
convo.say(message, options, callback)
```
Send the user a message using the provided options, takes an optional callback that runs after the message has been sent.

```javascript
convo.converse(messages[], options, callback)
```
Sends the user an array of messages once at a time using the provided options, calls the provided callback with the user's response to each message in turn. Takes an optional callback that runs after all of the messages are sent.

### Options for convo.say() and convo.converse()
```javascript
{
  provider: '<Either messenger or twilio>',
  providerOptions: {
    phoneNumber: '<User phone number>' // For twilio
    recipientId: '<User facebook id>' // For Facebook messenger
  }
}
```
