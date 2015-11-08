var googleKey = "AIzaSyANz6rDMkj0vbUxFQQYuz3HuMluKtIa-Kk";
var uberKey = "mPwREC7G-2Va31dK1MxF5d2jOrfmcJ2EiaVlIl8t";

function getGPSCoordinates(callback) {  //Callback gets lat and long
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


function fetchPriceAndDistance(start_latitude, start_longitude, end_latitude, end_longitude) {
  var req = new XMLHttpRequest();

  var url = 'https://api.uber.com/v1/estimates/price?start_latitude=' 
    + start_latitude + '&start_longitude=' + start_longitude + '&end_latitude='
    + end_latitude + '&end_longitude=' + end_longitude;
  console.log(url);
  
  req.open('GET', url);
  req.setRequestHeader("Authorization", "token " + uberKey);

  req.onload = function() {
    if (req.readyState === 4) {
      if (req.status === 200) {
        console.log("fetchPriceAndDistance received data");
  
        var output = {};
        var res = JSON.parse(req.response);

        output.price = res.prices[0].estimate;
        output.distance = res.prices[0].distance;

        console.log("Uber output: " + JSON.stringify(output));
        return output;
      }
    }
  };
  req.send(null);
}


function manageMsg(msg) {
  var dest = {};
  var uberPrice;
  
  function fetchCoordinateFromAddress(address) {
    var req = new XMLHttpRequest();
    var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + 
      address + '&key=' + googleKey;

    console.log(url);

    req.open('GET', url );
    req.onload = function() {
      if (req.readyState === 4) {
        if (req.status === 200) {
          console.log("fetchCoord received data");

          var res = JSON.parse(req.response);

          dest.address = address;
          dest.coord = res.results[0].geometry.location

          console.log(JSON.stringify(res.results[0].geometry.location));
          uberPrice = fetchPriceAndDistance(40.740886, -73.998168, dest.coord.lat, dest.coord.lng );
        }
      }
    };
    req.send(null);
  }  
  
  function getProbableLocation(lat, long, search) {
    var req = new XMLHttpRequest();
    var url = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?input=' + search 
      + '&location=' + lat + ',' + long + '&radius=1000&key=' + googleKey;
    console.log(url);

    req.open('GET', url);
    req.onload = function() {
      if (req.readyState === 4) {
        if (req.status === 200) {
          console.log("getProbableLocation received data");

          var output = {};
          var res = JSON.parse(req.response);

          console.log(JSON.stringify(res));

          output.address = res.predictions[0].description;
          fetchCoordinateFromAddress(output.address);
        }
      }
    };
    req.send(null);
  }
  
  console.log("Start with getProbableLocation");

  getProbableLocation(40.740886, -73.998168, msg);
}


Pebble.addEventListener('ready', function(e) {
  console.log('JavaScript app ready and running!' + e.ready);
  console.log(e.type);
});


Pebble.addEventListener('appmessage', function(e) {
    var msg = JSON.stringify(e.payload.KEY_TARGET);
    console.log('Received message: ' + msg);

    var output = manageMsg(msg);
});