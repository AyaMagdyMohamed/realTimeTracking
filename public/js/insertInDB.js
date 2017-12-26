var db = require('../../dbConnection.js')
db.Promise = require('bluebird')

class Test {
  constructor () {
          // Socket Initialization
    this.trackObjectId = ''
    this.isTrackExistsInDB = false
    this.isTrackedInCurrentSocket = false
    this.lastBucketSize = 0
    this.currentBucketNo = 0
    this.localLocations = []
  }

  setisTracked (isTrackedInCurrentSocket) {
    this.isTrackedInCurrentSocket = isTrackedInCurrentSocket
  }

  getisTracked () {
    return this.isTrackedInCurrentSocket
  }

  setisExists (isTrackExistsInDB) {
    this.isTrackExistsInDB = isTrackExistsInDB
  }
  getisExists () {
    return this.isTrackExistsInDB
  }

  async dataInsertion (trackId, localLocations) {
    var self = this

    console.log('isTrackedInCurrentSocket', this.getisTracked())

 // for (var i = 0; i < maxRecords; i++) {

   // localLocations.push(i);
    console.log('size', localLocations.length)
    console.log('traaaaack', trackId)

    if (localLocations.length == Test.INSERT_BUFFER_SIZE) {
      // Insert records
      if (!this.getisTracked()) {
        console.log('inside if')

        await db.model('track_coordinates').findOne({track: trackId}, {track: true}, {upsert: true}).exec().then(async function (data) {
         // console.log(data)
          if (data != null) {
            console.log('helllooooooooooooo')
             // this.isTrackExistsInDB=true
            self.setisExists(true)
              // trackObjectId=data.track
            await self.getLastBucketSizeFromDB(trackId).then(function (lastBucketSize) {
              console.log('callback function')
              self.lastBucketSize = lastBucketSize
            }
                     )

            await self.getLastBucketNumberFromDB(trackId).then(function (bucketNo) {
              self.currentBucketNo = bucketNo
            })
          }

          // console.log("check ", this.isTrackExistsInDB);
        })
        this.setisTracked(true)
      }

      console.log('isExists', this.getisExists())
      console.log('bucketNo', this.currentBucketNo, '   ', self.currentBucketNo)
      console.log('bucketSize', this.lastBucketSize, '  ', self.lastBucketSize)
      if (!this.getisExists()) {
        // console.log("trackID",trackId);
        // console.log("size---------> ",localLocations.length)
        this.handleNewTrack(trackId, localLocations)
      } else {
        this.handleExistingTrack(trackId, localLocations)
      }

      // Clear local locations
      localLocations.splice(0, localLocations.length)
  //  }// end of for loop
    }// end of if

  // At socket disconnect, insert remaining records
  // handleExistingTrack(localLocations);
  }

  handleNewTrack (trackid, locations) {
    console.log('inside function', trackid, locations)

  // var trackModel=db.model("tracks");
  // var new_track=new trackModel();
  // new_track.trackID=trackid;
  // new_track.save(function(err,insertedDocument){
  //              console.log("insertedDocument",insertedDocument._id);
  //              trackObjectId=insertedDocument._id;

    var temp = []
    if (Test.INSERT_BUFFER_SIZE <= Test.BUCKET_SIZE) {
      this.insertInDB(trackid, this.currentBucketNo, locations)
      this.lastBucketSize = locations.length
      console.log('lastBucketSize', this.lastBucketSize)
      console.log('currentBucketNo', this.currentBucketNo)
    } else {
    //   split the localLocations array on multiple documents based on BUCKET_SIZE and insert in DB as a bulk
    //  update last bucket size
      while (locations.length > 0) {
      // temp=[];
        temp = locations.splice(0, Test.BUCKET_SIZE)
        console.log('temp', temp)
        this.insertInDB(trackid, this.currentBucketNo, temp)
        if (temp.length == Test.BUCKET_SIZE) { this.currentBucketNo++ }
      }
      this.lastBucketSize = temp.length
      console.log('lastBucketSize', this.lastBucketSize)
      console.log('currentBucketNo', this.currentBucketNo)
    }

    this.isTrackExistsInDB = true
 // isTrackedInCurrentSocket = true;
// })
  }

  handleExistingTrack (trackId, locations) {
    var temp = []
    console.log('inside existing function', locations)

  // getLastBucketNumberFromDB();

  // Get last bucket size from DB if not tracked in current socket
  // if(!isTrackedInCurrentSocket) {
  //   lastBucketSize = getLastBucketSizeFromDB(trackId);
  //   currentBucketNo = getLastBucketNumberFromDB(trackId);
  //   isTrackedInCurrentSocket = true;
  // }

    if (Test.INSERT_BUFFER_SIZE <= Test.BUCKET_SIZE) {
      var remainingSizeInBucket = Test.BUCKET_SIZE - this.lastBucketSize

      var numRecordsToBeInserted = Math.min(remainingSizeInBucket, locations.length)

      if (remainingSizeInBucket >= locations.length) {
        this.insertInDB(trackId, this.currentBucketNo, locations.slice(0, numRecordsToBeInserted))
        this.lastBucketSize += numRecordsToBeInserted
      } else {
        this.insertInDB(trackId, this.currentBucketNo, locations.slice(0, remainingSizeInBucket))
        this.currentBucketNo++
        this.insertInDB(trackId, this.currentBucketNo, locations.slice(remainingSizeInBucket, Math.min(Test.BUCKET_SIZE, locations.length)))
        this.lastBucketSize = Math.min(Test.BUCKET_SIZE, locations.length) - remainingSizeInBucket
      }
    } else {
    // split the localLocations array on multiple documents based on BUCKET_SIZE and insert in DB as a bulk
    // update last bucket size
      remainingSizeInBucket = Test.BUCKET_SIZE - this.lastBucketSize
      this.insertInDB(trackId, this.currentBucketNo, locations.slice(0, remainingSizeInBucket))
      this.currentBucketNo++
      while (locations.length > 0) {
      // temp=[];
        temp = locations.splice(0, Test.BUCKET_SIZE)
        this.insertInDB(trackId, this.currentBucketNo, temp)
        if (temp.length == Test.BUCKET_SIZE) { this.currentBucketNo++ }
      }
      this.lastBucketSize = temp.length
      console.log('currentBucketNo', this.currentBucketNo)
      console.log('lastBucketSize', this.lastBucketSize)
    }
  }
  insertInDB (trackID, bucketNo, locations) {
    if (!locations.length == 0) {
      console.log('Insert Track [' + trackID + '], bucket [' + bucketNo + '] :' + locations)

  //  var trackModel=db.model("track_coordinates");
  //  var new_track=new trackModel();
  //  new_track.track=trackID;
  //  new_track.location=locations;
  //  new_track.bucket=bucketNo;
  //  new_track.save(function(err,insertedDocument){
  //               console.log("insertedDocument",insertedDocument._id);
  // //              trackObjectId=insertedDocument._id;

  //  })
 // db.track_coordinates.update({$and:[{"track":ObjectId("5a23e773cf96e91804403917")},{bucket:2}]},{$push:{location:{$each:[1,2]}}},{upsert:true});
      db.model('track_coordinates').update({$and: [{track: trackID}, {bucket: bucketNo}]}, {$push: {location: {$each: locations}}}, {upsert: true}, function (err, data) {
        if (err) { console.log('error update', err) } else { console.log(data) }
      })
    }
  }
// async function checkTrackExistence(trackId) {

//   //  check if sxist in db
//   var bool=false;
//   await db.model("tracks").findOne({trackID:trackId}).exec().then(function(data)
// {

//   if(data!=null)
//   {
//     bool=true
//     isTrackExistsInDB=true
//   }

// })

// }

  async getLastBucketNumberFromDB (trackId) {
    console.log('inside get last buck num', trackId)
    var bucket = 0
    await db.model('track_coordinates').find({track: trackId}, {bucket: 1, _id: 0}).sort({bucket: -1}).limit(1).then(function (data) {
      if (data[0] != null) {
        console.log('bucket num ', data[0].bucket)
        bucket = data[0].bucket
      }
    })

    return bucket
  }

  async getLastBucketSizeFromDB (trackId) {
    var bucketSize = 0
    console.log('inside bucket size', trackId)
    await db.model('track_coordinates').find({track: trackId}, {location: 1, _id: 0}).sort({bucket: -1}).limit(1).then(function (data) {
      if (data[0] != null) {
        console.log('bucket num ', data[0].location.length)
        bucketSize = data[0].location.length
      }
    })

    return bucketSize
  }
}
// module.exports.dataInsertion=dataInsertion;
// configurations
Test.INSERT_BUFFER_SIZE = 3 // Size of locally cached locations before inserting in DB
Test.BUCKET_SIZE = 4 // Maximum locations array size in one document in DB

module.exports = Test
