import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faEye, faEyeSlash} from '@fortawesome/free-solid-svg-icons';
import Colors from '../../colors/Colors';
import {
  faGoogle,
  faSquareFacebook,
  faTwitter,
} from '@fortawesome/free-brands-svg-icons';
import ToastManager, {Toast} from 'toastify-react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import {ImagesAssets} from '../../assets/ImagesAssets';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

const Login = ({navigation}) => {
  const [loading, setLoading] = useState(false);

  const webClientId =
    '688026635349-is2hdk645voc6k039o9s2m04d55vqdtf.apps.googleusercontent.com';

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: webClientId,
    });
  }, []);

  const googleLogin = async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const {idToken} = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(
        googleCredential,
      );
      const user = userCredential.user;

      // Check if user data already exists in Firebase Realtime Database
      const userRef = database().ref('users/' + user.uid);
      const snapshot = await userRef.once('value');

      if (!snapshot.exists()) {
        // Save new user data to Firebase Realtime Database
        userRef.set({
          name: user.displayName,
          email: user.email,
          profile_picture: user.photoURL,
        });
      }

      Toast.success('Sign in Successfully');

      setTimeout(() => {
        navigation.navigate('Drawer');
      }, 2000); // Delay for 2 seconds
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Toast.error('Sign in cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Toast.warning('Sign in in progress');
        console.log('Sign in in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Toast.error('Play services not available');
      } else {
        Toast.error('Some other error: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView>
      <ToastManager />
      <StatusBar backgroundColor={Colors.primary} />
      <Spinner visible={loading} color={Colors.primary} size={'large'} />
      <ScrollView>
        <View
          style={{
            backgroundColor: Colors.primary,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}>
          <Text style={styles.title}>User Login</Text>
        </View>
        <View
          style={{
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Image
            source={ImagesAssets.logoApp}
            style={{width: 100, height: 100}}
          />
          <Text
            style={{fontSize: 22, fontWeight: '800', color: Colors.primary}}>
            SpeechText
          </Text>
        </View>
        <View
          style={{
            marginTop: 80,
            padding: 30,
          }}>
          <TouchableOpacity
            onPress={googleLogin}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              marginTop: 10,
              backgroundColor: '#55ACEE',
              borderRadius: 10,
              justifyContent: 'center',
              paddingHorizontal: 10,
              paddingVertical: 13,
            }}>
            <FontAwesomeIcon size={25} icon={faGoogle} color="red" />
            <Text
              style={{color: Colors.white, fontSize: 16, fontWeight: '600'}}>
              Sign in with Google
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              marginTop: 10,
              backgroundColor: '#3B5998',
              borderRadius: 10,
              justifyContent: 'center',
              paddingHorizontal: 10,
              paddingVertical: 13,
            }}>
            <FontAwesomeIcon icon={faSquareFacebook} size={25} color="white" />
            <Text
              style={{color: Colors.white, fontSize: 16, fontWeight: '600'}}>
              Sign in with Facebook
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              marginTop: 10,
              backgroundColor: 'gray',
              borderRadius: 10,
              justifyContent: 'center',
              paddingHorizontal: 10,
              paddingVertical: 13,
            }}>
            <FontAwesomeIcon icon={faTwitter} size={25} color="white" />
            <Text
              style={{color: Colors.white, fontSize: 16, fontWeight: '600'}}>
              Sign in with Twitter
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
});

export default Login;
