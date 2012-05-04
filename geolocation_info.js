if (Ti.Platform.osname === 'iphone' || Ti.Platform.osname === 'ipad') {
  var Ember = require('/lib/em_ti/ember-runtime');
} else {
  Ti.include('/lib/em_ti/ember-runtime-android.js');
}

var GeolocationInfo = Ember.Object.extend({
  cardinal: null,
  
  bearing: function() {
    var lat1 = this.get('lat1'), lng1 = this.get('lng1'), lat2 = this.get('lat2'), lng2 = this.get('lng2');
    
    if (Ember.none(lat1) || Ember.none(lng1) || Ember.none(lat2) || Ember.none(lng2)) return;
    
		lat1 = lat1 * Math.PI/180;
		lat2 = lat2 * Math.PI/180;
		var dLng = (lng2-lng1) * Math.PI/180;
		var y = Math.sin(dLng) * Math.cos(lat2);
		var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
		var bearing = ((Math.atan2(y, x) * 180/Math.PI) + 360) % 360;
		return bearing;
  }.property('lat1', 'lng1', 'lat2', 'lng2'),
  
  distance: function() {
    var lat1 = this.get('lat1'), lng1 = this.get('lng1'), lat2 = this.get('lat2'), lng2 = this.get('lng2');
    
    if (Ember.none(lat1) || Ember.none(lng1) || Ember.none(lat2) || Ember.none(lng2)) return;
    
    var R = 6371; // km
		var dLat = (lat2-lat1) * Math.PI/180;
		var dLng = (lng2-lng1) * Math.PI/180;
		var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * 
            Math.sin(dLng/2) * Math.sin(dLng/2); 
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		var d = R * c;
		return d / 1.609344; // Divided by 1.609344 to get miles
  }.property('lat1', 'lng1', 'lat2', 'lng2'),
  
  formattedDistance: function() {
		var distance = this.get('distance');
		
		if (Ember.none(distance) || isNaN(distance)) return '. . .';
		
		var formattedDistance = '';
		if (distance < 0.284) { // Display as feet starting at 1500 feet
			formattedDistance = (Math.round(distance * 5280 * 100)/100) + ' ft';
		} else {
			formattedDistance = (Math.round(distance * 100)/100) + ' mi';
		}
		return formattedDistance;
	}.property('distance'),
	
	formattedDistanceWithCardinal: function() {
		var formattedDistance = this.get('formattedDistance'), cardinal = this.get('cardinal');
		
		if (formattedDistance === '. . .' || Ember.none(cardinal)) return '. . .';
		
		return formattedDistance + ' ' + cardinal;
	}.property('formattedDistance', 'cardinal'),
	
  // Try to not fire off too many observers by only updating cardinal if it's different.
  // I'm not sure if it actually helps, but it may keep formattedDistanceWithCardinal from firing an extra time
	bearingDidChange: function() {
		var bearing = this.get('bearing'), cardinal = this.get('cardinal');
		
		if (Ember.none(bearing)) return;

		var cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'];
		// var cardinals = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest', 'north'];
		var newCardinal = cardinals[Math.round(bearing/45)];
    if (cardinal !== newCardinal) {
      this.set('cardinal', newCardinal);
    }
	}.observes('bearing')
});

module.exports = GeolocationInfo;