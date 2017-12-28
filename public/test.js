
$(document).ready(function () {
  console.log('tesssst')
  var url = document.location.href
  var params = url.split('?')[1].split('&')
  var data = {}
  var tmp
  
  for (var i = 0, l = params.length; i < l; i++) {
    tmp = params[i].split('=')
    data[tmp[0]] = tmp[1]
    data[tmp[1]] = tmp[2]
    data[tmp[2]] = tmp[3]
  }
  console.log('urlllllll', data.lat, data.long)

  var arrOFPositins = []
  var socket = io.connect()
  var savedPlaces = []
  var myLatlng = new google.maps.LatLng(data.lat, data.long)
  var myOptions = {
    zoom: 15,
    center: myLatlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }
  var map = new google.maps.Map(document.getElementById('map'), myOptions)
  var flightPlanCoordinates = []
  var marker = new SlidingMarker({
    position: myLatlng,
    map: map,
    duration: 6000,
    title: data.trackId,
    draggable: true
  })

  $.get('savedPlaces', function (data) {
    // console.log("Data: " + data );
    arrOFPositins = data
    for (var i = 0; i < arrOFPositins.length; i++) {
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(arrOFPositins[i].lat, arrOFPositins[i].long),
        map: map,
        icon: 'static/GoogleMapsMarkers/yellow_MarkerB.png',
        title: arrOFPositins[i].lat + ',' + arrOFPositins[i].long,
        placeID: arrOFPositins[i].placeID
      })

      savedPlaces.push(marker)
    }
  })

  flightPlanCoordinates.push({lat: Number(data.lat), lng: Number(data.long)})

  function moveCursor (socketData) {
    console.log('--------------data-------------')
    console.log(socketData.id)
    console.log(socketData.lat)
    console.log(socketData.long)

    console.log('just funna move it...')
    marker.setPosition(new google.maps.LatLng(socketData.lat, socketData.long))

    flightPlanCoordinates.push({lat: Number(socketData.lat), lng: Number(socketData.long)}
                    )
    console.log('size issssssssss', flightPlanCoordinates.length)
    if (flightPlanCoordinates.length == 2) {
      var flightPath = new google.maps.Polyline({
        path: flightPlanCoordinates,

        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2

      })
      flightPath.setMap(map)
                          // map.fitBounds(latLngBounds);
      var temp = flightPlanCoordinates[1]
      flightPlanCoordinates = [temp]
    }
  }

  socket.on('data', function (socketData) {
            // setInterval(moveCursor(data),10000);

    if ((socketData.id == data.trackId) == true) { moveCursor(socketData) }
    console.log('dataaa', socketData.id)
    console.log('comparing', (socketData.id == data.trackId))
  })

  socket.on('search', function (id, lat, long, info, status) {
    console.log('inside search')
    console.log('info', info)
    console.log('status', status)

    var infowindow = new google.maps.InfoWindow()
    var item = {}

    
    item = savedPlaces.find(item => item.placeID == id)

    console.log('item', typeof (item))
    if (typeof (item) !== 'object') {
      console.log('inside if for push ')
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat, long),
        map: map,
        icon: 'static/GoogleMapsMarkers/blue_MarkerB.png',
        title: id,
        placeID: id

      })
      savedPlaces.push(marker)
    }

    for (var i = 0; i < savedPlaces.length; i++) {
      console.log('markersLength', savedPlaces.length)

      console.log(savedPlaces[i].placeID, '    ', id)
      if (savedPlaces[i].placeID == id && status == 'success') {
        savedPlaces[i].setIcon('static/GoogleMapsMarkers/darkgreen_MarkerS.png')
        google.maps.event.addListener(savedPlaces[i], 'click', (function (marker, i) {
          return function () {
            infowindow.setContent(info)
            infowindow.open(map, marker)
          }
        })(savedPlaces[i], i))
      } else if (savedPlaces[i].placeID == id && status == 'fail') {
        savedPlaces[i].setIcon('static/GoogleMapsMarkers/red_MarkerF.png')
        google.maps.event.addListener(savedPlaces[i], 'click', (function (marker, i) {
          return function () {
            infowindow.setContent(info)
            infowindow.open(map, marker)
          }
        })(savedPlaces[i], i))
      } else {
        console.log('false')
      }
    }
  })
})
