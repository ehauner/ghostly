const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let cache = null;

/**
* Gets all clips within 5 miles
* @param {number} lat
* @param {number} lon
* @returns {array}
*/
module.exports = (lat, lon, context, callback) => {
    let uri = process.env['MONGO_URI'];
    try {
        if (cache === null) {
            MongoClient.connect(uri,
                (error, db) => {
                    if (error) {
                        console.log(error['errors']);
                        return callback(error);
                    } else {
                        console.log("No error")
                    }
                    cache = db;
                    readAudio(lat, lon, db, callback);
                });
        } else {
          readAudio(lat, lon, cache, callback);
        }
    } catch (error) {
        console.log(error);
        return callback(error);
    }
};


const readAudio = (lat, lon, db, callback) => {
    let cursor = db.collection('audio').find(
        {"loc":
            {$geoWithin:
                {$centerSphere:
                    [[lat, lon],
                    10/3963.2]}}}
    );

    console.log(cursor)
    let audios = [];

    cursor.each((error, item) => {
        if (error) {
          console.log(error);
        }
        if (item === null) {
          return callback(null, audios);
        }
        audios.push({
          id: item._id,
          url: item.url,
          location: {
          	latitude: item.loc.coordinates[0],
          	longitude: item.loc.coordinates[1]
          }
        });
    });
};