if (Ti.Platform.osname === 'iphone') {
  var Ember = require('/lib/em_ti/ember-runtime');
} else {
  Ti.include('/lib/em_ti/ember-runtime-android.js');
}

var PostClient = Ember.Object.extend({
  appName: null,
  host: null,
  url: null,
  data: null,
  
  fullUrl: function() {
    return this.get('host') + this.get('url');
  }.property('host', 'url').cacheable(),
  
  init: function() {
    this._super();
    this.set('xhr', Ti.Network.createHTTPClient());
  },
  
  send: function() {
    if (!Titanium.Network.online) {
      self.error({error: 'Please check your internet connection and try again.'});
    } else {
      var xhr = this.get('xhr'), fullUrl = this.get('fullUrl'), data = this.get('data'), self = this;
      
      Ti.API.debug('[PostClient] URL: ' + fullUrl);
      Ti.API.debug('[PostClient] Send Data: ' + JSON.stringify(data));
      
      self.startLoading();

      xhr.onerror = function(e) {
        self.error(e);
      };

      xhr.onload = function() {
        self.doneLoading();

        var parsedJSON;
        try {
          parsedJSON = JSON.parse(this.responseText);
        } catch(e) {
          Ti.API.warn('[PostClient] Error Parsing: ' + this.responseText);
          self.error({error: 'Sorry, there was a problem. Please try again.'});
        }
        if (parsedJSON.error) {
          self.error(parsedJSON);
        } else {
          self.success(parsedJSON);
        }
        self.destroy();
      };
      xhr.open('POST', fullUrl);
      xhr.send(data);
    }
  },
  
  startLoading: function() {
    // Show loading indicator
  },
  
  doneLoading: function() {
    // Hide loading indicator
  },
  
  success: function(data) {
    Ti.API.warn('[PostClient] Override the success function');
  },
  
  error: function(e) {
    var message = null, self = this;
    
    if (typeof(e.error) === 'string' && e.error.indexOf('timed out') !== -1) {
      message = 'Request timed out. Please try again.';
		} else if (typeof(e.error) === 'string' && e.error.indexOf('request was cancelled') !== -1) {
			// Do nothing, user cancelled request
		} else if (e.error) {
      message = e.error;
		} else {
      message = 'Sorry, there was a problem. Please try again.';
      Ti.API.warn('[PostClient] Unknown Error: ' + JSON.stringify(e));
		}
		if (message !== null) {
      Ti.API.warn('[PostClient] Error: ' + message);
      
      if (message === 'Request timed out. Please try again.') {
        // Ask if they want to retry
        var retryAlertDialog = require('/lib/em_ti/ui/alert_dialog').create({
          title: this.get('appName'),
          message: message,
          buttonNames: ['Retry', 'Cancel'],
          
          click: function(event) {
            if (event.index === 0) {
              self.send();
            } else {
              self.doneLoading();
              self.destroy();
            }
          }
        });
        retryAlertDialog.show();
      } else {
        var errorAlertDialog = require('/lib/em_ti/ui/alert_dialog').create({
          title: this.get('appName'),
          message: message.replace('. ', '.\n'),
          buttonNames: ['Ok']
        });
        errorAlertDialog.show();
        this.doneLoading();
        this.destroy();
      }
		}
  },
  
  destroy: function() {
    this.set('xhr', null);
    this._super();
  }
});

module.exports = PostClient;