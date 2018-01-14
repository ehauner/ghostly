const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
let cache = null;

/**
* Post clip to map, return clipId

* @param {number} lat
* @param {number} lon
* @returns {string} 
*/
module.exports = (lat, lon, context, callback) => {
  var azure = require('azure-storage');
  var uniqid = require('uniqid');
  var urlUnique = uniqid();
  var retryOperations = new azure.ExponentialRetryPolicyFilter();
  var blobSvc = azure.createBlobService(process.env['AZURE_STORAGE_CONNECTION_STRING']).withFilter(retryOperations);
  blobSvc.createContainerIfNotExists('ghostly', {publicAccessLevel : 'blob'}, function(error, result, response){
    if(error){
      console.log(error);
      callback(null, "complete");
    } else {
      // Container exists and allows anonymous read access to blob content and metadata within this container
      console.log("Container exists and allows anonymous read access to blob content and metadata within this container");
      var testData = "/Users/bernhardt1/Music/ghostly_inception.wav";
      blobSvc.createBlockBlobFromLocalFile('ghostly', urlUnique, testData, function(error, result, response){
        if(error){
          console.log(error);
          callback(null, "complete");
        }
        else {
          // file uploaded
          console.log("file uploaded");
          // add to other database
          var url = "https://cs4913bc9b0d99dx4c21x8ba.blob.core.windows.net/ghostly/";
          url += urlUnique;
          let lat = context.params.lat || 0;
          let lon = context.params.lon || 0;
          let audio = {
            url: url,
            loc: {
              type: "Point",
              coordinates: [
                lat,
                lon
              ]
            }
          };
          let uri = process.env['MONGO_URI'];
          try {
            if (cache === null) {
              mongoClient.connect(uri, (error, db) => {
                if (error) {
                  console.log(error['errors']);
                  return callback(error);
                }
                cache = db;
                createAudio(db, audio, callback);
              });
            } else {
              createAudio(cache, audio, callback);
            }
          } catch (error) {
            console.log(error);
            return callback(error);
          }
        }
      });
    }
  });
};

const createAudio = (db, audio, callback) => {
  db.collection('audio').insertOne(audio, (error, result) => {
    if (error) {
      console.log(error);
      return callback(null, error);
    }
    return callback(null, result.insertedId.toString());
  });
};

