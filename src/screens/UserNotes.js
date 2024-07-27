import React, {useState, useEffect} from 'react';
import {
  FlatList,
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Spinner from 'react-native-loading-spinner-overlay';
import Modal from 'react-native-modal';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import Colors from '../colors/Colors';
import ToastManager, {Toast} from 'toastify-react-native';

const UserNotes = () => {
  const [userNotes, setUserNotes] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false); // Separate loading state for update process
  const [selectedNote, setSelectedNote] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      setUserId(currentUser.uid);
    } else {
      setLoading(false); // Hide loading if no user is logged in
    }
  }, []);

  useEffect(() => {
    if (userId) {
      const notesRef = database().ref(`users/${userId}/notes`);

      const onValueChange = notesRef.on('value', snapshot => {
        const notes = snapshot.val();
        if (notes) {
          const notesList = Object.keys(notes).map(key => ({
            id: key,
            description: notes[key].description,
            time: notes[key].time,
          }));
          setUserNotes(notesList);
        } else {
          setUserNotes([]);
        }
        setLoading(false);
      });

      return () => {
        notesRef.off('value', onValueChange);
      };
    }
  }, [userId]);

  const handleNotePress = note => {
    setSelectedNote(note);
    setEditDescription(note.description);
    setIsModalVisible(true);
  };

  const handleUpdate = async () => {
    if (selectedNote) {
      setUpdating(true); // Show spinner during update process
      const noteRef = database().ref(
        `users/${userId}/notes/${selectedNote.id}`,
      );
      await noteRef.update({description: editDescription});
      setUpdating(false); // Hide spinner after update
      setIsModalVisible(false);
      Toast.success('Text Updated');
    }
  };

  const handleDelete = async () => {
    if (selectedNote) {
      setUpdating(true); // Show spinner during delete process
      const noteRef = database().ref(
        `users/${userId}/notes/${selectedNote.id}`,
      );
      await noteRef.remove();
      setUpdating(false); // Hide spinner after delete
      setIsModalVisible(false);
      Toast.success('Text Deleted');
    }
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <ToastManager position="top" />
      <Spinner visible={loading} color={Colors.primary} size={'large'} />
      <Text style={styles.header}>Notes</Text>
      <FlatList
        data={userNotes}
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={() => handleNotePress(item)}
            style={styles.noteWrapper}>
            <View style={styles.noteContainer}>
              <Text
                style={styles.description}
                numberOfLines={3}
                ellipsizeMode="tail">
                {item.description}
              </Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        numColumns={2}
      />
      <Modal isVisible={isModalVisible}>
        <View style={styles.modalContainer}>
          <Spinner visible={updating} color={Colors.primary} size={'large'} />
          <Text style={styles.modalHeader}>Edit Note</Text>
          <TextInput
            style={styles.modalInput}
            multiline
            value={editDescription}
            onChangeText={setEditDescription}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButton} onPress={handleUpdate}>
              <Text style={styles.modalButtonText}>Update</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonCancel]}
              onPress={() => setIsModalVisible(false)}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonDelete]}
              onPress={handleDelete}>
              <Text style={styles.modalButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 21,
    fontWeight: '700',
    color: 'black',
    marginVertical: 10,
    padding: 10,
  },
  noteWrapper: {
    flex: 1,
    margin: 5,
  },
  noteContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#E2E2EB',
    borderRadius: 8,
    padding: 10,
  },
  description: {
    fontSize: 18,
    marginBottom: 5,
  },
  time: {
    fontSize: 13,
    color: '#666',
    textAlign: 'right',
  },
  listContainer: {
    flexGrow: 1,
  },
  spinnerTextStyle: {
    color: Colors.primary,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Adjusted to make space for delete button
    gap: 10,
    marginTop: 20,
  },
  modalButton: {
    padding: 10,
    backgroundColor: Colors.primary,
    borderRadius: 5,
  },
  modalButtonCancel: {
    backgroundColor: '#999',
  },
  modalButtonDelete: {
    backgroundColor: 'red', // Added delete button style
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default UserNotes;
