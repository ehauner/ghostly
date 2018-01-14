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
      currentTime: 0.0,
      recording: false,
      audioPath: AudioUtils.DocumentDirectoryPath + '/test.aac',
    }
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

  // Center on the user's current position
  componentDidMount() {
    this.prepareRecordingPath(this.state.audioPath);
    AudioRecorder.onProgress = (data) => {
      this.setState({currentTime: Math.floor(data.currentTime)});
    };

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

  async record() {
    this.setState({recording: true});
    try {
      const filePath = await AudioRecorder.startRecording();
    } catch (error) {
      console.error(error);
    }
  }

  async stopRecording() {
    this.setState({recording: false});
    try {
      const filePath = await AudioRecorder.stopRecording();
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
    console.log(`Finished recording of duration ${this.state.currentTime} seconds at path: ${filePath}`);
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

          <TouchableOpacity onPress={() => (this.state.recording ? this.stopRecording() : this.record())}
            style={this.state.recording ? styles.recordButtonRecording : styles.recordButton }
            activeOpacity={.8}
          >
            <View style={styles.recordIcon}></View>
          </TouchableOpacity>

          <TouchableHighlight onPress={() => this.refreshClips()}
            style={styles.button}
            underlayColor={'#66a3ff'}
          >
            <Image
              style={styles.buttonIcon}
              source={require('./images/refresh.png')}
            />
          </TouchableHighlight>

          <TouchableHighlight onPress={() => this.playRecording()}
            style={styles.button}
            underlayColor={'#66a3ff'}
          >
            <Image
              style={styles.buttonIcon}
              source={require('./images/play.png')}
            />
          </TouchableHighlight>

        </View>
        <Text style={styles.progressText}>{this.state.currentTime}s</Text>

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
  recordButtonRecording: {
    width: 60,
    height: 60,
    borderRadius: 60,
    backgroundColor: 'red',
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