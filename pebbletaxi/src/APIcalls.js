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


// function getProbableLocation(lat, long, location) {
// 	var req = new XMLHttpRequest();
// 	var url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + lat + ','
// 		+ long + '&radius=500&types=point_of_interest&name=' + location + '&key=' + googleKey;
// 	req.open('GET', url);
// 	req.onload = function() {
// 		if (req.readyState === 4) {
// 			if (req.status === 200) {
// 				var output = {};
// 				res = JSON.parse(req.response);
// 				output.coordinates = res.results[0].geometry.location;
// 				output.name = res.results[0].name;
// 				output.address = res.results[0].vicinity;
// 				console.log(output);
// 				return output;
// 			}
// 		}
// 	};
// 	req.send(null);
// }


function fetchCoordinateFromAddress(address) {
	var req = new XMLHttpRequest();
	req.open('GET', 'https://maps.googleapis.com/maps/api/geocode/json?address=' + 
		address + '&key=' + googleKey );
	req.onload = function() {
		if (req.readyState === 4) {
			if (req.status === 200) {
				res = JSON.parse(req.response);
				console.log(res.results[0].geometry.location);
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


function getProbableLocation(lat, long, search) {
	var req = new XMLHttpRequest();
	var url = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?input=' + search 
		+ '&location=' + lat + ',' + long + '&radius=1000&types=point_of_interest&key=' + googleKey;
	req.open('GET', url);
	req.onload = function() {
		if (req.readyState === 4) {
			if (req.status === 200) {
				var output = {};
				res = JSON.parse(req.response);

				output.address = res.predictions[0].description;
				output.coord = fetchCoordinateFromAddress(output.address);

				console.log(output);

				return output;
			}
		}
	};
	req.send(null);
}


// fetchPriceAndDistance(40.740886, -73.998168, 40.745454, -73.988748);
// fetchCoordinateFromAddress("42 Broadway Manhattan, NY 10036");
// getProbableLocation(40.740886, -73.998168, "Penn Station");

Pebble.addEventListener('ready', function(e) {
	console.log('JavaScript app ready and running!' + e.ready);
	console.log(e.type);
});

Pebble.addEventListener('appmessage',

	function(e) {
		var msg = JSON.stringify(e.payload.KEY_TARGET);
		//console.log('Received message: ' + e[KEY_TARGET]);
		console.log('Received message: ' + msg);

		var dest = getProbableLocation(40.740886, -73.998168, msg);
		var uberPrice = fetchPriceAndDistance(40.740886, -73.998168, dest.coord.lat, dest.coord.lang );
		
	}
);

