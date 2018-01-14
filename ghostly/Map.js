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
  Platform,
} from 'react-native';
import MapView from 'react-native-maps';
import { getClipLocations, addClip, getClip } from './Api.js';

import Sound from 'react-native-sound';
import {AudioRecorder, AudioUtils} from 'react-native-audio';

let audioPath = AudioUtils.DocumentDirectoryPath + '/test.aac';

var geodist = require('geodist')
var { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;

// (Initial Static Location) Vancouver
const LATITUDE = 49.282729;
const LONGITUDE = -123.120738;
const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

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
      currentTime: 0.0,
      duration: 0.0,
      recording: false,
      audioPath: AudioUtils.DocumentDirectoryPath + '/test.aac',
    }
    this.timer = null;
  }

  prepareRecordingPath(audioPath){
    AudioRecorder.prepareRecordingAtPath(audioPath, {
      SampleRate: 22050,
      Channels: 1,
      AudioQuality: "Low",
      AudioEncoding: "aac",
      AudioEncodingBitRate: 32000
    });
  }

  componentWillMount() {
    this.refreshClips();
  }

  getDistArr(position) {
    return this.state.clips.map(x => { return geodist({lat: position.coords.latitude, lon: position.coords.latitude},
      {lat: x.location.latitude, lon: x.location.longitude})});
  }

  // Center on the user's current position
  componentDidMount() {
    this.prepareRecordingPath(this.state.audioPath);
    AudioRecorder.onProgress = (data) => {
      if (data >= 10) this.stopRecording();
      else this.setState({
        currentTime: Math.round(data.currentTime * 100) / 100,
        duration: Math.round(data.currentTime * 100) / 100
      });
    };
    AudioRecorder.onFinished = (data) => {
      // Android callback comes in the form of a promise instead.
      if (Platform.OS === 'ios') {
        this._finishRecording(data.status === "OK", data.audioFileURL);
      }
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log(position.coords);
        this.setState(
          {userPosition: position.coords},
          () => this.centerOnUser(),
        );
        console.log(this.state.clips);
        var dists = this.getDistArr(position);
        console.log(dists);
      },
      //(error) => alert(JSON.stringify(error)),
      (error) => alert("Error getting initial position."),
      //{enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    );
    this.watchID = navigator.geolocation.watchPosition(
      (position) => {
        this.setState(
          {userPosition: position.coords},
          () => this.centerOnUser(),
        );
        var dists = this.getDistArr(position);
       console.log(dists);
      },
      
      //(error) => alert(JSON.stringify(error)),
      (error) => alert("Error updating position."),
//      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
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

  async record() {
    clearInterval(this.timer);
    this.setState({recording: true});
    try {
      const filePath = await AudioRecorder.startRecording();
    } catch (error) {
      console.error(error);
    }
  }

  async stopRecording() {
    this.setState({
      recording: false,
      currentTime: 0.0
    });
    try {
      const filePath = await AudioRecorder.stopRecording();
      Alert.alert(
        'Share your clip?',
        'Everybody will be able to hear it',
        [
          {text: 'Cancel', onPress: () => clearInterval(this.timer)},
          {text: 'Share', onPress: () => {
            clearInterval(this.timer);
            addClip(this.state.userPosition, filePath)
          }},
        ],
        { 
          cancelable: false,
          onDismiss: () => clearInterval(this.timer)
        }
      );
      if (Platform.OS === 'android') {
        this._finishRecording(true, filePath);
      }
      return filePath;
    } catch (error) {
      console.error(error);
    }
  }

  _finishRecording(didSucceed, filePath) {
    this.setState({ finished: didSucceed });
    this.playRecording();
    this.timer = setInterval(() => {
      this.playRecording();
    }, this.state.duration + 2000);
  }

  async playRecording() {
    if (this.state.recording) {
      await this.stopRecording();
    }

    // These timeouts are a hacky workaround for some issues with react-native-sound.
    // See https://github.com/zmxv/react-native-sound/issues/89.
    setTimeout(() => {
      var sound = new Sound(this.state.audioPath, '', (error) => {
        if (error) {
          console.log('failed to load the sound', error);
        }
      });

      setTimeout(() => {
        sound.play((success) => {
          if (success) {
            console.log('successfully finished playing');
          } else {
            console.log('playback failed due to audio decoding errors');
          }
        });
      }, 100);
    }, 100);
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

          <TouchableHighlight onPressIn={() => this.record()} onPressOut={() => this.stopRecording()}
            style={styles.recordButton}
            underlayColor={'red'}
          >
            <View style={{
              width: 20 + this.state.currentTime * 4,
              height: 20 + this.state.currentTime * 4,
              backgroundColor: 'white',
              borderRadius: 60,
              }}>
            </View>
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