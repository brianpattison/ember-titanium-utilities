# Ember-Titanium Utilities

## GetClient and PostClient Usage

```javascript
var sendData = { 
  firstName: 'Brian',
  lastName: 'Pattison'
};

var getClient = require('/lib/em_ti_utilities/get_client').create({
  appName: "Brian's App",
  host: "http://brianpattison.com",
  url: '/api/v1/whois.json',
  data: sendData,
  
  startLoading: function() {
    Ti.API.debug('Fires at the start of the request.');
  },
  
  doneLoading: function() {
    Ti.API.debug('Fires after loading, successful request or not.');
  },
  
  success: function(data) {
    // Parsed data is returned
    Ti.API.info(JSON.stringify(data));
  }
  
  // You can choose to override the error function or an alert 
  // dialog will be used to display the error message, and timeout 
  // error is handled with an option dialog to retry the request.
  
  // error: function(e) {
  //
  // }
  
}).send();

// This will result in a GET request to the URL:
// http://brianpattison.com/api/v1/whois.json?firstName=Brian&lastName=Pattison

```

## Add Ember-Titanium Utilities to your Titanium Project

Use this command in Terminal while in the root directory of your Titanium project:

`$ git submodule add git://github.com/brianpattison/ember-titanium-utilities.git Resources/lib/em_ti_utilities`

## GitHub: Working with submodules

http://help.github.com/submodules