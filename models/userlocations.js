var db = require('../dbConnection.js')
// var mongoose=require("mongoose")
var timestamps = require('mongoose-timestamp')
// register model
var Schema = db.Schema
var userlocations = new Schema({

  userID: {type: String, required: false},
  location: { type: Array, 'default': [], required: true }, // [Long, Lat]
  trackID: {type: String, required: true},
  startTime: {type: Date},
  endTime: {type: Date}

})
userlocations.plugin(timestamps)
// ORM
db.model('userlocations', userlocations)
