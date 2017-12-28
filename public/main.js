
$(document).ready(function () { 
  console.log('tesssst')
  var socket = io.connect()
  var btnHide = document.getElementById('btnHide')
  var btnShow = document.getElementById('btnShow')
  var url = document.location.href
  console.log(url)
    // Used to remember markers
  var savedMarkers = {}
  btnHide.onclick = hide
  btnShow.onclick = show
  var marker
  var myLatlng = new google.maps.LatLng(30.020122, 31.305276)
  var myOptions = {
    zoom: 10,
    center: myLatlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }
  var map = new google.maps.Map(document.getElementById('map'), myOptions)

  function moveCursor (data) {
    console.log('--------------data-------------')
    console.log(data.id)
    console.log(data.lat)
    console.log(data.long)

    if (savedMarkers.hasOwnProperty(data.id)) {
      console.log('just funna move it...')
      savedMarkers[data.id].setPosition(new google.maps.LatLng(data.lat, data.long))
    } else {
      if (Object.keys(savedMarkers).length == 0) {
        map.setCenter(new google.maps.LatLng(data.lat, data.long))
      }
      marker = new SlidingMarker({
        position: new google.maps.LatLng(data.lat, data.long),
        title: url + 'test.html?' + 'trackId=' + data.id,
        duration: 6000,
        map: map,
        draggable: true,
        url: url + 'test.html?' + 'trackId=' + data.id + '&lat=' + data.lat + '&long=' + data.long})
      marker.addListener('click', function () {
        window.open(this.url, '_blank')
      })

      savedMarkers[data.id] = marker
      addcheckBox(data.id)
    }
  }
  var addcheckBox = function (id) {
    var newCheckbox = document.createElement('input')
    newCheckbox.type = 'checkbox'
    newCheckbox.value = id
    newCheckbox.name = 'checkbox'
    newCheckbox.checked = true
    document.getElementById('list').appendChild(newCheckbox)

    var label = document.createElement('label')
    label.htmlFor = id
    label.appendChild(document.createTextNode(id))

    document.getElementById('list').appendChild(label)
    document.getElementById('list').appendChild(document.createElement('br'))
  }
  socket.on('data', function (data) {
    moveCursor(data)
   
  })

  function hide () {
    var checkbox = document.getElementsByName('checkbox')
    for (var i = 0; i < checkbox.length; i++) {
      if (checkbox[i].checked == false) {
        savedMarkers[checkbox[i].value].setVisible(false)
      }
    }
  }

  function show () {
    var checkbox = document.getElementsByName('checkbox')
    for (var i = 0; i < checkbox.length; i++) {
      savedMarkers[checkbox[i].value].setVisible(true)
      checkbox[i].checked = true
    }
  }
}

)
