import React, { Component } from 'react';
import {
  View,
  Modal,
  Text,
  TouchableHighlight,
  StyleSheet,
  Dimensions,
  Geolocation,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import MapView from 'react-native-maps';
import { getClipLocations, addClip, getClip } from './Api.js';

var { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;

// (Initial Static Location) Vancouver
const LATITUDE = 49.282729;
const LONGITUDE = -123.120738;
const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
var timer;

const INITIAL_REGION = {
  latitude: LATITUDE,
  longitude: LONGITUDE,
  latitudeDelta: LATITUDE_DELTA,
  longitudeDelta: LONGITUDE_DELTA,
};

class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      region: INITIAL_REGION,
      userPosition: null,
      clips: null,
    }
  }

  componentWillMount() {
    this.refreshClips();
  }

  // Center on the user's current position
  componentDidMount() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log(position.coords);
        this.setState(
          {userPosition: position.coords},
          () => this.centerOnUser(),
        );
      },
      (error) => alert(JSON.stringify(error)),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    );
    this.watchID = navigator.geolocation.watchPosition(
      (position) => {
        this.setState(
          {userPosition: position.coords},
          () => this.centerOnUser(),
        );
      },
      (error) => alert(JSON.stringify(error)),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    );
  }

  // Clear the listener for the user's current position
  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
  }

  centerOnUser() {
    this.setState({
      region: {
        latitude: this.state.userPosition.latitude,
        longitude: this.state.userPosition.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
    });
    console.log('centered');
  }

  refreshClips() {
    this.setState({
      clips: getClipLocations()
    });
  }

  onRegionChange(region) {
    this.setState({region});
  }

  render() {
    return (
      <View style={styles.container}>

        {/* Map that shows user location */}
        <MapView
          style={styles.map}
          initialRegion={INITIAL_REGION}
          region={this.state.region}
          onRegionChange={region => this.onRegionChange(region)}
          showsUserLocation={true}
        >
          {this.state.clips.map((clip, i) => (
            <MapView.Marker
              key={i}
              coordinate={clip.location}
              title={clip.id.toString()}
              description={clip.id.toString()}
            />
          ))}
        </MapView>

        <View style={styles.buttons}>

          <TouchableHighlight onPress={() => this.centerOnUser()}
            style={styles.button}
            underlayColor={'#66a3ff'}
          >
            <Image
              style={styles.buttonIcon}
              source={require('./images/center.png')}
            />
          </TouchableHighlight>

          <TouchableHighlight onPress={() => this.refreshClips()}
            style={styles.recordButton}
            underlayColor={'#66a3ff'}
          >
            <View style={styles.recordIcon}></View>
          </TouchableHighlight>

          <TouchableHighlight onPress={() => this.refreshClips()}
            style={styles.button}
            underlayColor={'#66a3ff'}
          >
            <Image
              style={styles.buttonIcon}
              source={require('./images/refresh.png')}
            />
          </TouchableHighlight>

        </View>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerButton: {
    height: 50
  },
  description: {
    marginBottom: 20,
    fontSize: 18,
    textAlign: 'center',
    color: '#656565'
  },
  buttons: {
    position: 'absolute',
    bottom: 0,
    paddingBottom: 30,
    paddingLeft: 30,
    paddingRight: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: width,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 40,
    backgroundColor: '#3385ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButton: {
    width: 60,
    height: 60,
    borderRadius: 60,
    backgroundColor: '#3385ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordIcon: {
    width: 30,
    height: 30,
    backgroundColor: 'white',
    borderRadius: 30,
  },
  buttonIcon: {
    width: 30,
    height: 30,
  },
  map: {
    flex: 1,
  }
});

module.exports = Map;