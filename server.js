var express = require('express')
var app = express()
var server = require('http').Server(app)
var io = require('socket.io')(server)
var shortid = require('shortid')
const insertInDB = require('./public/js/insertInDB')
var fs = require('fs')
var db = require('./dbConnection.js')
var swaggerUi = require('swagger-ui-express')
var swaggerDocument = require('./swagger.json')
var userController = require('./controllers/users')
var trackController = require('./controllers/tracks')
const path = require('path')

// var arrOFPositins = [{"lat":30.061887,"long":31.337479},{"lat":30.061978,"long":31.337738},{"lat":30.062210, "long":31.339283},{"lat":30.062328,"long": 31.340105},{"lat":30.062457,"long":31.341140},{"lat":30.062578,"long": 31.342063},{"lat":30.062671, "long":31.342835},{"lat":30.062727, "long":31.343479},{"lat":30.062718,"long": 31.343726}]
var arrOFPositins = [

  {
    'lat': 30.059166,
    'long': 31.337057,
    'placeID': '1',
    'info': 'not found',
    'status': 'fail'
  },
  {
    'lat': 30.060051,
    'long': 31.337120,
    'placeID': '2',
    'info': 'sold',
    'status': 'success'
  },
  {
    'lat': 30.061501,
    'long': 31.337485,
    'placeID': '3',
    'info': 'sold',
    'status': 'success'
  },
  {
    'lat': 30.063363,
    'long': 31.336536,
    'placeID': '4',
    'info': ' sold 3000 amount',
    'status': 'success'
  },
  {
    'lat': 30.065643,
    'long': 31.337094,
    'placeID': '5',
    'info': 'sold 5000 amount',
    'status': 'success'
  },
  {
    'lat': 30.066657,
    'long': 31.334881,
    'placeID': '6',
    'info': 'not found',
    'status': 'fail'
  }

]
var arrOFPositins2 = [

  {
    'lat': 30.043784,
    'long': 31.236625,
    'placeID': '7',
    'info': 'found',
    'status': 'success'
  },
  {
    'lat': 30.044851,
    'long': 31.238084,
    'placeID': '8',
    'info': 'not found',
    'status': 'fail'
  },
  {
    'lat': 30.045929,
    'long': 31.239740,
    'placeID': '9',
    'info': 'sold',
    'status': 'success'
  },
  {
    'lat': 30.046764,
    'long': 31.238137,
    'placeID': '10',
    'info': ' not found',
    'status': 'fail'
  },
  {
    'lat': 30.049951,
    'long': 31.239554,
    'placeID': '11',
    'info': 'sold 2000 amount',
    'status': 'success'
  }
]

var tracks = {}
var tracksIDs = {}
var tracksSocketIDs = {}

// Set Middleware for Static Files "JS,CSS,Images"
app.use('/static', express.static(path.join(__dirname, '/public')))
app.use('/', userController)
app.use('/', trackController)
app.get('/savedPlaces', function (req, resp) {
  // resp.send("hello from saved places");
  db.model('saved_places').find({}, {'_id': 0}, function (err, data) {
    resp.send(data)
  })
})

app.get('/test.html', function (req, resp) {
  resp.sendfile(path.join(__dirname, '/views/test.html'))
})

app.get('/', function (req, res) {
  res.sendfile(path.join(__dirname, '/views/index.html')) 
})

app.get('/index2', function (req, res) {
      // res.sendfile(__dirname+"/views/index.html");
  res.sendfile(path.join(__dirname, '/views/index2.html'))
})

function doSetTimeout (i, location, ID) {
  setTimeout(function () { io.emit('data', {id: ID, lat: location.lat, long: location.long}) }, 6000 * i)
}
function fireSearchEvent (i, visitedLocation) {
  // console.log("inside search event",visitedLocation.lat,visitedLocation.long,info);
  setTimeout(function () { io.emit('search', visitedLocation.placeID, visitedLocation.lat, visitedLocation.long, visitedLocation.info, visitedLocation.status) }, 8000 * i)
}

io.on('connection', function (socket) {
  var id = shortid.generate()
  let insertObj = new insertInDB()
  var trackObjectId

  console.log('a user connected')

  socket.on('startTrack', function (ID) {
    // console.log("trackID",id);
    socket.emit('startTrack', id) // uncommet this line after remove simulation part
    // for simulation
    // if (ID == 1) {
    //   arr = arrOFPositins
    // } else if (ID == 2) {
    //   arr = arrOFPositins2
    // }
    // for (var i = 0; i < arr.length; i++) {
    //   doSetTimeout((i + 1), arr[i], id)
    //   fireSearchEvent((i + 1), arr[i])
    // }

    var TrackModel = db.model('tracks')
    var new_track = new TrackModel()
    new_track.trackID = id
    new_track.startTime = new Date()
    new_track.save(function (err, insertedDocument) {
      console.log('insertedTrack', insertedDocument._id)
      trackObjectId = insertedDocument._id
      if ((id in tracksIDs) == false) {
        tracksIDs[id] = trackObjectId
      }

      if (socket.id in tracksSocketIDs == false) {
        tracksSocketIDs[socket.id] = id
      }
    })
  })

  // isTrackedInCurrentSocket=true
  // insertInDB.dataInsertion("3");
  var locationsList = []

  socket.on('location', function (trackId, latitude, longitude) {
    io.emit('data', {id: trackId, lat: latitude, long: longitude})
    socket.emit('data2', {id: trackId, lat: latitude, long: longitude})
    console.log('trackId', trackId)
    console.log('latitude', latitude)
    console.log('longitude', longitude)
    if (socket.id in tracksSocketIDs == false) {
      tracksSocketIDs[socket.id] = trackId
    }

    if (trackId != null) {
      locationsList.push({'lat': String(latitude), 'long': longitude, 'timeSent': new Date()})
      if ((trackId in tracksIDs) == false) {
        tracksIDs[trackId] = trackObjectId
      }

      console.log('tracksIDs[trackId]', tracksIDs[trackId])
      insertObj.dataInsertion(tracksIDs[trackId], locationsList)
    }
    tracks[socket.id] = locationsList
  })

  socket.on('disconnect', async function () {
    console.log('disconnected', socket.id)
    console.log('track id socketIDS', tracksSocketIDs[socket.id])
    console.log(tracks[socket.id])
    if (socket.id in tracks) {
      var trackId = tracksSocketIDs[socket.id]
      console.log('tracksIDs[trackId]', tracksIDs[trackId])
      if (tracks[socket.id].length != 0) {
        await insertObj.getLastBucketSizeFromDB(tracksIDs[trackId]).then(function (lastBucketSize) {
          console.log('current bucket size', lastBucketSize)
          insertObj.lastBucketSize = lastBucketSize
        })
        await insertObj.getLastBucketNumberFromDB(tracksIDs[trackId]).then(function (currentBucketNo) {
          console.log('current bucket numbeeeeer', currentBucketNo)
          insertObj.currentBucketNo = currentBucketNo
          console.log(insertObj.currentBucketNo)
          console.log(insertObj.lastBucketSize)
          insertObj.handleExistingTrack(tracksIDs[trackId], tracks[socket.id])
        })
      }
    }
  })

  socket.on('endTrack', function (trackID) {
    console.log('inside end track')
    console.log(trackID)
    db.model('tracks').update({'trackID': String(trackID)}, {$set: {'endTime': new Date()}}, function (err, data) {
      if (err) { console.log(err) }

    })
  })

  socket.on('search', function (id, lat, long, status, info) {
    socket.broadcast.emit('search', id, lat, long, status, info)
  })
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
var files_arr = fs.readdirSync(path.join(__dirname, '/models'))
files_arr.forEach(function (file) {
  require(path.join(__dirname, '/models/', file))
})
server.listen(process.env.PORT || 3000, function () {
  console.log('listening on *:3000')
})

// to dedect disconnect of client in case of no internet after 4 seconds
io.set('heartbeat timeout', 4000)
io.set('heartbeat interval', 2000)

process.on('SIGINT', function () {
  db.connection.close(function () {
    console.log('Mongoose default connection is disconnected due to application termination')
    process.exit(0)
  })
})
