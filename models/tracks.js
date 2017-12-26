// var mongoose=require("mongoose")
var db = require('../dbConnection.js')
// register model
var Schema = db.Schema
var trackSchema = new Schema({

  userID: {
    type: Schema.ObjectId,
    ref: 'users'
  },
  trackID: {type: String, required: true},
  startTime: {type: Date},
  endTime: {type: Date},
  num_buckets: {type: Number, 'default': 0},

  trackCoordinates: {
    type: Schema.ObjectId,
    ref: 'track_coordinates'
  }

})
// ORM
db.model('tracks', trackSchema)
