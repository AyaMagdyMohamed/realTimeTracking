var express = require('express')
var db = require('../dbConnection.js')
var router = express.Router()

router.get('/getTracks', function (req, resp) {
  db.model('tracks').find({}, function (err, data) {
    //  db.model("tracks").populate(data,{path:"userID"},function (err,data) {
    //  console.log(data);
    //  resp.send(data);
    // });

    resp.send(data)
  })
})
router.get('/getTrackData/:trackId', function (req, resp) {
  var trackId = JSON.parse(req.params.trackId)
  db.model('tracks').find({'trackID': trackId}, function (err, data) {
  //   db.model("tracks").populate(data,{path:"userID"},function (err,data) {
  //   console.log(data);
  //   resp.send(data);
  //  });

    resp.send(data)
  })
})

router.get('/getTrackPoints/:trackId', function (req, resp) {
  var trackId = JSON.parse(req.params.trackId)
  console.log(trackId)
  db.model('tracks').findOne({trackID: trackId}, {'_id': 1}, function (err, data) {
    db.model('track_coordinates').aggregate({$match: {'track': db.Types.ObjectId(data._id)}}, {$unwind: '$location'},
    function (err, data) {
      console.log(data)
      resp.send(data)
    })
  })
})

module.exports = router
