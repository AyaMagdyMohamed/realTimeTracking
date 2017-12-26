// var mongoose=require("mongoose")
var db = require('../dbConnection.js')
// register model
var Schema = db.Schema

var savedPlacesSchema = new Schema({

  placeID: {type: String},
  lat: {type: Number, 'default': 0},
  long: {type: Number, 'default': 0},
  timeSent: {type: Date}

})
// ORM
db.model('saved_places', savedPlacesSchema)
