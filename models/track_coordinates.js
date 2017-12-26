// var mongoose=require("mongoose")
var db = require('../dbConnection.js')
// register model
var Schema = db.Schema
var track_coordinates_schema = new Schema({

  track: {
    type: Schema.ObjectId,
    ref: 'tracks'
  },

  location: { type: Array, 'default': [], required: true }, // [Long, Lat]
  bucket: {type: Number, default: 0},
  count: {type: Number}

})
// ORM
db.model('track_coordinates', track_coordinates_schema)
