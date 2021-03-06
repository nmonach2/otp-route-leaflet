var map = new L.Map('map', {
  center: [47, 8],
  maxBounds: [[45, 4], [48,11]],
  minZoom: 7,
  maxZoom: 18,
  zoom: 8
});

var osmLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);


var currentPointField = 'fromPoint';

map.on('click', function(e){
  var pt = e.latlng;
  $('#'+currentPointField).val(pt.lat + ',' + pt.lng);
  currentPointField = currentPointField == 'fromPoint' ? 'toPoint' : 'fromPoint';
});

function calculateRoute(){

  var fromPoint = $('#fromPoint').val();
  var toPoint = $('#toPoint').val();

  $.ajax({
    url: 'http://130.223.67.145:8080/otp/routers/ch/plan',
    type: 'GET',
    dataType: 'json',
    data: {
      fromPlace: fromPoint,
      toPlace: toPoint,
      mode: 'CAR,WALK'
    },
    success: drawRoute,
    error: calculateRouteError,
    beforeSend: setHeader
  });

}

function setHeader(xhr){
  xhr.setRequestHeader('Accept', 'application/json');
}

function drawRoute(data){
  console.log('drawRoute', data);

  if (data.error){
    alert(data.error.msg);
    return;
  }

  // Show the first itinerary (OTP returns several alternatives)
  var itin = data.plan.itineraries[0];
  for (var i=0; i < itin.legs.length; i++){
    var leg = itin.legs[i].legGeometry.points;
    var geomLeg = polyline.toGeoJSON(leg);
    L.geoJSON(geomLeg, {
      style: function(feature){
        return { 
          color: '#0000ff',
          opacity: 0.7
        };
      }
    }).addTo(map);
  }

  // Show origin and destination

  var origin = L.circleMarker(
    [data.plan.from.lat, data.plan.from.lon],
    {
      color: '#000000',
      fillOpacity: 0.5,
      fillColor: '#ff0000'
    }
  ).addTo(map);
  
  var destination = L.circleMarker(
    [data.plan.to.lat, data.plan.to.lon],
    {
      color: '#000000',
      fillOpacity: 0.5,
      fillColor: '#0000ff'
    }
  ).addTo(map);

}

function calculateRouteError(error){
  alert('Error during route calculation.');
  console.log('Routing error', error);
}
