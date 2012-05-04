var Ember = require('/lib/em_ti/ember-runtime');

var GeolocationController = Ember.Object.extend({
  content: null,
  
  accuracy: Titanium.Geolocation.ACCURACY_BEST,
  distanceFilter: 10,
  purpose: null,
  watching: false,
  
  lat: function() {
    if (Ember.none(this.get('content'))) return;
    return this.get('content').coords.latitude;
  }.property('content'),
  
  lng: function() {
    if (Ember.none(this.get('content'))) return;
    return this.get('content').coords.longitude;
  }.property('content'),
  
  timestamp: function() {
    if (Ember.none(this.get('content'))) return;
    return this.get('content').coords.timestamp;
  }.property('content'),
  
  init: function() {
    this._super();
    
    if (this.get('purpose') === null) {
      Ti.API.warn('[Geolocation] You must set the purpose to use geolocation.');
    } else {
      Ti.Geolocation.preferredProvider = this.get('preferredProvider');
      Ti.Geolocation.purpose = this.get('purpose');
      Ti.Geolocation.accuracy = this.get('accuracy');
      Ti.Geolocation.distanceFilter = this.get('distanceFilter');
      this.refreshPosition();
    }
  },
  
  destroy: function() {
    if (this.get('watching')) {
      Ti.Geolocation.removeEventListener('location', function(e) {
        self.refreshPosition(e);
      });
    }
    this._super();
  },
  
  error: function(e, callback) {
    Ti.API.warn("[Geolocation] Error: " + this.translateErrorCode(e.code));
    // this.set('content', {
    //   coords: {
    //     latitude: 45,
    //     longitude: -96
    //   }
    // });
    if (callback) callback();
  },
  
  refreshPosition: function(data, callback) {
    var self = this;
    // If a function is passed, call it after successfully getting position
    if (typeof data === 'function') {
      callback = data;
      Ti.Geolocation.getCurrentPosition(function(e) {
        self.refreshPosition(e, callback);
      });
    // If nothing is passed, just update the current position
    } else if (Ember.none(data)) {
      Ti.Geolocation.getCurrentPosition(function(e) {
        self.refreshPosition(e);
      });
    // Handle the returned data from Ti.Geolocation.getCurrentPosition
    } else {
      Ember.run(function() {
        if (!data.success || data.error) {
          self.error(data, callback);
        } else {
          self.success(data, callback);
        }
      });
    }
  },
  
  success: function(e, callback) {
    var lastTimestamp = this.get('timestamp'), newTimestamp = e.coords.timestamp;
    if (Ember.none(lastTimestamp) || (newTimestamp - lastTimestamp) >= 2000) {
      if (this.get('lat') !== e.coords.latitude || this.get('lng') !== e.coords.longitude) {
        this.set('content', e);
      }
    }
    if (callback) callback();
  },
  
  translateErrorCode: function(code) {
    if (code === null) return null;
    switch (code) {
      case Ti.Geolocation.ERROR_LOCATION_UNKNOWN:
        return "Location unknown";
      case Ti.Geolocation.ERROR_DENIED:
        return "Access denied";
      case Ti.Geolocation.ERROR_NETWORK:
        return "Network error";
      case Ti.Geolocation.ERROR_REGION_MONITORING_DENIED:
        return "Region monitoring access denied";
      case Ti.Geolocation.ERROR_REGION_MONITORING_FAILURE:
        return "Region monitoring access failure";
      case Ti.Geolocation.ERROR_REGION_MONITORING_DELAYED:
        return "Region monitoring setup delayed";
    }
  },
  
  watchPosition: function() {
    var self = this;
    if (!this.get('watching')) {
      this.set('watching', true);
      Ti.Geolocation.addEventListener('location', function(e) {
        self.refreshPosition(e);
      });
    } else {
      Ti.API.debug('[Geolocation] Already watching position.');
    }
  }
});

module.exports = GeolocationController;