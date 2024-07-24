import React, {useEffect, useState} from 'react';
import {View, Text, Image, ScrollView} from 'react-native';
import Colors from '../colors/Colors';
import auth from '@react-native-firebase/auth';
import Spinner from 'react-native-loading-spinner-overlay';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth().currentUser;
        if (currentUser) {
          setUser(currentUser); // Set user data
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data: ', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Spinner visible={loading} color={Colors.primary} size={'large'} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.coverPhotoContainer}>
          <View style={styles.coverPhoto} />
        </View>
        <View style={styles.profileContainer}>
          <Image
            style={styles.profilePhoto}
            source={{
              uri: user.photoURL
                ? user.photoURL
                : 'https://www.bootdey.com/img/Content/avatar/avatar1.png',
            }}
          />
          <Text style={styles.nameText}>{user && user.displayName}</Text>
        </View>
      </View>
      <View>
        <Text style={styles.bioText}>{user.email}</Text>
      </View>
      {/* <View style={styles.statsContainer}>
        <View style={styles.statContainer}>
          <Text style={styles.statCount}>1234</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        <View style={styles.statContainer}>
          <Text style={styles.statCount}>5678</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statContainer}>
          <Text style={styles.statCount}>9101</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
      </View> */}
      {/* Uncomment when handling edit profile functionality */}
      {/* <TouchableOpacity style={styles.button} onPress={handleEditPress}>
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity> */}
    </ScrollView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    padding: 10,
  },
  coverPhotoContainer: {
    backgroundColor: '#E2E2EB',
    marginTop: 10,
    borderRadius: 10,
    width: '100%',
    height: 200,
  },
  coverPhoto: {
    width: '100%',
    height: '100%', // Cover the entire container
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: -50,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },

  bioText: {
    fontSize: 16,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 20,
  },
  statContainer: {
    alignItems: 'center',
    flex: 1,
  },
  statCount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 16,
    color: '#999',
  },
  button: {
    backgroundColor: '#0066cc',
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 20,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
};

export default Profile;
