Pebble.addEventListener('ready', function(e) {
  console.log('JavaScript app ready and running!' + e.ready);
  console.log(e.type);
});

Pebble.addEventListener('appmessage',
  function(e) {
     //console.log('Received message: ' + e[KEY_TARGET]);
    console.log('Received message: ' + JSON.stringify(e.payload.KEY_TARGET));
    }
  
);