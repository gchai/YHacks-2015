var googleKey = "AIzaSyANz6rDMkj0vbUxFQQYuz3HuMluKtIa-Kk";
var uberKey = "mPwREC7G-2Va31dK1MxF5d2jOrfmcJ2EiaVlIl8t";


function getGPSCoordinates(callback) {	//Callback gets lat and long
	var locationOptions = {
		enableHighAccuracy: true, 
		maximumAge: 10000, 
		timeout: 10000
	};

	function locationSuccess(pos) {
		console.log('lat= ' + pos.coords.latitude + ' lon= ' + pos.coords.longitude);
		callback(pos.coords.latitude, pos.coords.longitude);
	}

	function locationError(err) {
		console.log('location error (' + err.code + '): ' + err.message);
	}

	// Request current position
	navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);
}


function fetchCoordinateFromAddress(address) {
	var req = new XMLHttpRequest();
	req.open('GET', 'https://maps.googleapis.com/maps/api/geocode/json?address=' + 
		address + '&key=' + googleKey );
	req.onload = function() {
		if (req.readyState === 4) {
			if (req.status === 200) {
				res = JSON.parse(req.response);
				return res.results[0].geometry.location;
			}
		}
	};
	req.send(null);
}


function fetchPriceAndDistance(start_latitude, start_longitude, end_latitude, end_longitude) {
	var req = new XMLHttpRequest();

	var url = 'https://api.uber.com/v1/estimates/price?start_latitude=' 
		+ start_latitude + '&start_longitude=' + start_longitude + '&end_latitude='
		+ end_latitude + '&end_longitude=' + end_longitude;

	req.open('GET', url);
	req.setRequestHeader("Authorization", "token " + uberKey);

	req.onload = function() {
		if (req.readyState === 4) {
			if (req.status === 200) {
				var output = {};
				res = JSON.parse(req.response);

				output.price = res.prices[0].estimate;
				output.distance = res.prices[0].distance;

				return res.prices[0].estimate;
			}
		}
	};
	req.send(null);
}

// fetchPriceAndDistance(40.740886, -73.998168, 40.745454, -73.988748);
// fetchCoordinates("42 Broadway Manhattan, NY 10036");

Pebble.addEventListener('ready', function(e) {
  console.log('JavaScript app ready and running!');
});

