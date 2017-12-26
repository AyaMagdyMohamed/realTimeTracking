// var mongoose=require("mongoose")
var db = require('../dbConnection.js')
// register model
var Schema = db.Schema
var users = new Schema({

  userName: {type: String, required: true},
  userID: {type: String, required: false}
})
// ORM
db.model('users', users)
