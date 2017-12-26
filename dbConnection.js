var mongoose = require('mongoose')
// mongodb://127.0.0.1:27017/gpsTracking
const databaseUri = process.env.DB_URI || 'mongodb://127.0.0.1:27017/gpsTracking'
mongoose.connect(databaseUri, function (err, database) {
  if (err) {
    console.log('error connecting to to db ')
    console.log(databaseUri)
  } else {
    console.log('connected to db')
  }
})

module.exports = mongoose
