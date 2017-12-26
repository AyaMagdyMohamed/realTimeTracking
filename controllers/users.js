var express = require('express')
var db = require('../dbConnection.js')
var router = express.Router()

router.get('/getUserTracks/:userId', function (req, resp) {
  // resp.send(req.params.userId);
  var userId = JSON.parse(req.params.userId)
  console.log(userId)
  db.model('users').findOne({'userID': userId}, {'_id': true}, function (err, data) {
    if (err) { console.log(err) } else { console.log(data) }
    db.model('tracks').find({'userID': data._id}, function (err, data) {
      if (!err) { resp.send(data) } else { resp.send(err) }
    })
  })
})

router.get('/getUsers', function (req, resp) {
  db.model('users').find({}, function (err, data) {
    if (!err) { resp.send(data) } else { resp.send(err) }
  })
})

router.get('/getUserData/:userId', function (req, resp) {
  var userId = JSON.parse(req.params.userId)
  db.model('users').findOne({'userID': userId}, function (err, data) {
    console.log(data)
    resp.send(data)
  })
})

module.exports = router
