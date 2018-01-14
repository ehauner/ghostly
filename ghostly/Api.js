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


// Gets stuff to put on the map:
// getClipIds({lat, lon}) returns [clipId, {lat, lon}]
export function getClipLocations(location={lat:  36.234, lon:-36.345}) {
    let lat = location.lat;
    let lon = location.lon;
    let url = "https://ghostly.lib.id/ghostlyAPI@dev/getClipLocations/"
    url = url + "?lat=" + lat + "&lon=" + lon 
    console.log(url)
    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            console.log("Clip Locations")
            console.log(data)
        })
        .catch((error) => {
            console.error(error)
        });
    return dummyClipLocations
}

// Post clip to map:
// addClip({lat, lon}, file) returns clipId
export function addClip(location, file) {
    return 3;
}

