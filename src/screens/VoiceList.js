import React, {useState, useEffect, useRef} from 'react';
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
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

const VoiceList = ({navigation}) => {
  const [recordTime, setRecordTime] = useState('00:00');

  const [playTime, setPlayTime] = useState('00:00');

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
    console.log(msg);

    audioRecorderPlayer.addPlayBackListener(e => {
      setPlayTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));

      return;
    });
  };

  const onStopPlay = async () => {
    console.log('onStopPlay');
    await audioRecorderPlayer.stopPlayer();
    audioRecorderPlayer.removePlayBackListener();
    setPlayingUrl('');
    setPlayingRecordingId(null);
    setIsPlaying(false);
  };

  const handleDelete = async () => {
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
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  const renderRecordingItem = ({item}) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.cardText}>
          Recording {moment(item.timestamp).format('MM-DD-YYYY hh:mm A')}
        </Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            setSelectedRecordingId(item.id);
            setShowDeleteModal(true);
          }}>
          <Icon name="trash" size={20} color="red" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => onStartPlay(item)}>
          <Icon
            name={isPlaying && playingUrl === item.url ? 'pause' : 'play'}
            size={20}
            color={Colors.primary}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.rowWithGap}>
        <Text style={styles.text}>
          {isPlaying && playingRecordingId === item.id ? playTime : '00:00'}
        </Text>
        {/* <Text>{moment(item.timestamp).format('MM-DD-YYYY hh:mm A')}</Text> */}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Spinner visible={loading} color={Colors.primary} size={'large'} />
      <TouchableOpacity
        style={{padding: 20}}
        onPress={() => navigation.navigate('Home')}>
        <Icon name="chevron-left" size={22} color={Colors.primary} />
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.list}>
        <FlatList
          data={recordings}
          renderItem={renderRecordingItem}
          keyExtractor={item => item.id}
          scrollEnabled={false} // Disable FlatList scrolling to allow ScrollView to handle it
        />
      </ScrollView>
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
          <Icon
            name={isRecording ? 'stop' : 'microphone'}
            size={30}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
      <Modal
        isVisible={showDeleteModal}
        onBackdropPress={() => setShowDeleteModal(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>
            Are you sure you want to delete this recording?
          </Text>
          <TouchableOpacity style={styles.modalButton} onPress={handleDelete}>
            <Text style={styles.modalButtonText}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => setShowDeleteModal(false)}>
            <Text style={styles.modalButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    fontSize: 20,
    margin: 8,
    fontWeight: '700',
    color: 'black',
  },
  list: {
    flexGrow: 1,
    width: '100%',
    paddingBottom: 110, // Add padding to avoid overlap with sticky elements
  },
  card: {
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  button: {
    // backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButton: {
    backgroundColor: '#FF5733',
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowWithGap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 60,
  },
  modalContent: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  stickyContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',

    borderTopWidth: 1,
    borderTopColor: '#ddd',
    alignItems: 'center',
  },
});

export default VoiceList;
