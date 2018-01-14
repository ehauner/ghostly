const https = require('https');
var ipAddress = 'localhost';
var port = '3000';

const LATITUDE = 49.282729;
const LONGITUDE = -123.120738;

var dummyClipLocations = [
    {
        id: 0,
        "https://cs4913bc9b0d99dx4c21x8ba.blob.core.windows.net/ghostly/sample.aac",
        location: {
            latitude: 49.261079,
            longitude: -123.248339,
        },
    },
    {
        id: 1,
        "https://cs4913bc9b0d99dx4c21x8ba.blob.core.windows.net/ghostly/sample.aac",
        location: {
            latitude: 49.261079,
            longitude: -123.247339,
        },
    },
    {
        id: 2,
        "https://cs4913bc9b0d99dx4c21x8ba.blob.core.windows.net/ghostly/sample.aac",
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
    return dummyClipLocations;
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