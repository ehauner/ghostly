const request = require('request');

var ipAddress = 'localhost';
var port = '3000';

const LATITUDE = 49.282729;
const LONGITUDE = -123.120738;

var dummyClipLocations = [
    {
        id: 0,
        url: "https://cs4913bc9b0d99dx4c21x8ba.blob.core.windows.net/ghostly/sample.aac",
        location: {
            latitude: 49.261079,
            longitude: -123.248339,
        },
    },
    {
        id: 1,
        url: "https://cs4913bc9b0d99dx4c21x8ba.blob.core.windows.net/ghostly/sample.aac",
        location: {
            latitude: 49.261079,
            longitude: -123.247339,
        },
    },
    {
        id: 2,
        url: "https://cs4913bc9b0d99dx4c21x8ba.blob.core.windows.net/ghostly/sample.aac",
        location: {
            latitude: 49.261079,
            longitude: -123.246339,
        },
    },
]

var dummyClip;

// Gets stuff to put on the map:
// getClipIds({lat, lon}) returns [clipId, {lat, lon}]
export function getClipLocations(location) {
    request('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY', { json: true }, (err, res, body) => {
        if (err) { return console.log(err); }
        console.log(res);
        console.log(body);});
}

// Post clip to map:
// addClip({lat, lon}, file) returns clipId
export function addClip(location, file) {
    return 3;
}

// Get clip:
// getClip({id}) returns file
export function getClip(id) {
    return dummyClip;
}