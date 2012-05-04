if (Ti.Platform.osname === 'iphone' || Ti.Platform.osname === 'ipad') {
  var Ember = require('/lib/em_ti/ember-runtime');
} else {
  Ti.include('/lib/em_ti/ember-runtime-android.js');
}

var GetClient = Ember.Object.extend({
  appName: null,
  host: null,
  url: null,
  data: null,
  
  fullUrl: function() {
    var fullUrl = this.get('host') + this.get('url'), data = this.get('data');
    
    Ti.API.debug('[GetClient] URL: ' + fullUrl);
    Ti.API.debug('[GetClient] Send Data: ' + JSON.stringify(data));
    
    if (!Ember.none(data)) {
      fullUrl += '?';
      var paramsArray = [];
			var param;
			for (param in data) {
				if (data[param]) {
					var key = param;
					var value = data[param];
					if (typeof(value) === 'string') {
						value = value.replace(/"/g, '');
					}
					paramsArray.push(key + '=' + encodeURI(value));
				}
			}
			fullUrl += paramsArray.join('&');
    }
    Ti.API.debug('[GetClient] URL with Params: ' + fullUrl);
    return fullUrl;
  }.property('data', 'host', 'url'),
  
  init: function() {
    this._super();
    this.set('xhr', Ti.Network.createHTTPClient());
  },
  
  send: function() {
    var self = this;
    
    if (!Titanium.Network.online) {
      self.error({error: 'Please check your internet connection and try again.'});
    } else {
      var xhr = this.get('xhr'), fullUrl = this.get('fullUrl');
      
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
          Ti.API.warn('[GetClient] Error Parsing: ' + this.responseText);
          self.error({error: 'Sorry, there was a problem. Please try again.'});
        }
        if (parsedJSON.error) {
          self.error(parsedJSON);
        } else {
          self.success(parsedJSON);
        }
        self.destroy();
      };
      xhr.open('GET', fullUrl);
      xhr.send();
    }
  },
  
  startLoading: function() {
    // Show loading indicator
  },
  
  doneLoading: function() {
    // Hide loading indicator
  },
  
  success: function(data) {
    Ti.API.warn('[GetClient] Override the success function');
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
      Ti.API.warn('[GetClient] Unknown Error: ' + JSON.stringify(e));
		}
		if (message !== null) {
      Ti.API.warn('[GetClient] Error: ' + message);
      
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
          message: message,
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

module.exports = GetClient;