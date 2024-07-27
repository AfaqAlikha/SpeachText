import React, {useState, useEffect, useRef} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import storage from '@react-native-firebase/storage';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/FontAwesome';
import Colors from '../colors/Colors';
import moment from 'moment';
import Spinner from 'react-native-loading-spinner-overlay';
import Modal from 'react-native-modal';
import {SwipeListView} from 'react-native-swipe-list-view';
import * as Progress from 'react-native-progress';
import {ImagesAssets} from '../assets/ImagesAssets';
import FastImage from 'react-native-fast-image';

const VoiceList = ({navigation}) => {
  const [recordTime, setRecordTime] = useState('00:00');
  const [playTime, setPlayTime] = useState('00:00');
  const [duration, setDuration] = useState(0);
  const [recordings, setRecordings] = useState([]);
  const [playingUrl, setPlayingUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [playingRecordingId, setPlayingRecordingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRecordingId, setSelectedRecordingId] = useState(null);

  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;

  useEffect(() => {
    fetchRecordings();
  }, []);

  const onStartRecord = async () => {
    const userId = auth().currentUser.uid;
    const newVoiceId = database().ref(`users/${userId}/recordings`).push().key;

    const result = await audioRecorderPlayer.startRecorder();

    setIsRecording(true);

    audioRecorderPlayer.addRecordBackListener(e => {
      setRecordTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
      return;
    });

    console.log(result);
  };

  const onStopRecord = async () => {
    const result = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();

    setIsRecording(false);

    const userId = auth().currentUser.uid;
    const newVoiceId = database().ref(`users/${userId}/recordings`).push().key;
    const fileUri = result;
    const reference = storage().ref(`recordings/${userId}/${newVoiceId}`);

    setLoading(true);
    try {
      await reference.putFile(fileUri);
      console.log('File uploaded to Firebase Storage');

      const fileURL = await reference.getDownloadURL();
      console.log('File URL:', fileURL);

      await database().ref(`users/${userId}/recordings/${newVoiceId}`).set({
        url: fileURL,
        timestamp: new Date().toISOString(),
        name: newVoiceId,
      });

      console.log('File URL saved to Firebase Realtime Database');
      fetchRecordings(); // Refresh the list after uploading
      setRecordTime('00:00');
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecordings = async () => {
    setLoading(true);
    const userId = auth().currentUser.uid;
    const snapshot = await database()
      .ref(`users/${userId}/recordings`)
      .once('value');
    const recordings = [];
    snapshot.forEach(childSnapshot => {
      recordings.push({
        id: childSnapshot.key,
        ...childSnapshot.val(),
      });
    });
    setRecordings(recordings.reverse());
    setLoading(false);
  };

  const onStartPlay = async item => {
    if (isPlaying && playingUrl === item.url) {
      onStopPlay();
      return;
    }

    if (isPlaying) {
      await onStopPlay();
    }

    console.log('onStartPlay');
    const msg = await audioRecorderPlayer.startPlayer(item.url);
    setPlayingUrl(item.url);
    setPlayingRecordingId(item.id);
    setIsPlaying(true);

    audioRecorderPlayer.addPlayBackListener(e => {
      setPlayTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
      setDuration(e.duration);
      return;
    });

    console.log(msg);
  };

  const onStopPlay = async () => {
    console.log('onStopPlay');
    await audioRecorderPlayer.stopPlayer();
    audioRecorderPlayer.removePlayBackListener();
    setPlayingUrl('');
    setPlayingRecordingId(null);
    setIsPlaying(false);
    setPlayTime('00:00');
  };

  const handleDelete = async () => {
    if (selectedRecordingId) {
      setLoading(true);
      try {
        const userId = auth().currentUser.uid;
        await storage()
          .ref(`recordings/${userId}/${selectedRecordingId}`)
          .delete();
        await database()
          .ref(`users/${userId}/recordings/${selectedRecordingId}`)
          .remove();
        console.log('Recording deleted from Firebase');
        fetchRecordings(); // Refresh the list after deletion
        setShowDeleteModal(false);
      } catch (error) {
        console.error('Delete failed:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const renderRecordingItem = ({item}) => {
    const progress =
      playingRecordingId === item.id && duration
        ? Math.min(
            Math.floor(
              (audioRecorderPlayer._playbackCurrentPosition || 0) / duration,
            ),
            1,
          )
        : 0;

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.cardText}>
            Recording {moment(item.timestamp).format('MM-DD-YYYY hh:mm A')}
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => onStartPlay(item)}>
            <Icon
              name={isPlaying && playingUrl === item.url ? 'pause' : 'play'}
              size={20}
              color={Colors.red}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.rowWithGap}>
          <Text style={styles.text}>
            {isPlaying && playingRecordingId === item.id ? playTime : '00:00'}
          </Text>
          <Progress.Bar
            progress={progress}
            width={null}
            color={Colors.primary}
            borderWidth={0}
            height={5}
            style={styles.progressBar}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Spinner visible={loading} color={Colors.primary} size={'large'} />
      <TouchableOpacity
        style={{
          padding: 20,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
        onPress={() => navigation.navigate('Home')}>
        <Icon name="chevron-left" size={22} color="black" />
        <Text style={{color: 'black', fontWeight: '600'}}>Back</Text>
      </TouchableOpacity>
      <Text
        style={{
          color: 'black',
          fontWeight: '700',
          marginVertical: 10,
          paddingHorizontal: 18,
          fontSize: 25,
        }}>
        Voice Recording
      </Text>

      <SwipeListView
        style={{paddingHorizontal: 10}}
        data={recordings}
        renderItem={renderRecordingItem}
        renderHiddenItem={(data, rowMap) => (
          <View style={styles.rowBack}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => {
                setSelectedRecordingId(data.item.id);
                setShowDeleteModal(true);
              }}>
              <Icon name="trash" size={25} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
        rightOpenValue={-75}
        onRowOpen={(rowKey, rowMap) => {
          // Optionally handle row open
        }}
        keyExtractor={item => item.id}
      />

      <View style={styles.stickyContainer}>
        <Text style={styles.text}>{recordTime}</Text>
        <TouchableOpacity
          style={styles.recordButton}
          onPress={() => {
            if (isRecording) {
              onStopRecord();
            } else {
              onStartRecord();
            }
          }}>
          {isRecording ? (
            <FastImage
              source={ImagesAssets.recordingimag}
              style={{width: 60, height: 60}}
            />
          ) : (
            <Image
              source={ImagesAssets.recordingimag}
              style={{width: 60, height: 60}}
            />
          )}
        </TouchableOpacity>
      </View>
      <Modal
        isVisible={showDeleteModal}
        onBackdropPress={() => setShowDeleteModal(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>
            Are you sure you want to delete this recording?
          </Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <TouchableOpacity style={styles.modalButton} onPress={handleDelete}>
              <Text style={styles.modalButtonText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowDeleteModal(false)}>
              <Text style={styles.modalButtonText}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  card: {
    padding: 15,
    borderRadius: 15,
    backgroundColor: '#f3f2f7',
    marginVertical: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowWithGap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  cardText: {
    fontSize: 16,
    color: 'black',
  },
  text: {
    fontSize: 14,
    color: Colors.gray,
  },
  button: {
    padding: 10,
  },
  progressBar: {
    marginTop: 5,
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    height: '90%',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    borderRadius: 15,
    marginVertical: 3,
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: 'red',

    borderRadius: 15,
    justifyContent: 'center',
    height: '100%',
    width: 75,
  },
  stickyContainer: {
    backgroundColor: Colors.white,

    alignItems: 'center',
  },
  recordButton: {
    marginTop: 10,
    borderRadius: 40,
    overflow: 'hidden',
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#02ccfe',
  },
  modalContent: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 10,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 15,
  },
  modalButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    color: Colors.primary,
  },
});

export default VoiceList;
