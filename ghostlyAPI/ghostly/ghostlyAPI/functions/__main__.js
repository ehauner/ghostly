/**
* Gets all elements from database
* @returns {array}
*/

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let cache = null;


module.exports = (context, callback) => {
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
                    readAudio(db, callback);
                });
        } else {
          readAudio(cache, callback);
        }
    } catch (error) {
        console.log(error);
        return callback(error);
    }
};


const readAudio = (db, callback) => {
    console.log(db)

    let cursor = db.collection('audio').find();

    console.log(cursor)
    let audios = [];

    cursor.each((error, item) => {
        if (error) {
          console.log(error);
        }
        console.log("1")
        if (item === null) {
          return callback(null, audios);
        }
        audios.push({
          id: item._id,
          url: item.url,
          completed: item.loc
        });
    });
  
};
