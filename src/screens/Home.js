import React, {useState, useEffect} from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  StatusBar,
  Modal,
  Button,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Voice from '@react-native-voice/voice';
import {ImagesAssets} from '../assets/ImagesAssets';
import Colors from '../colors/Colors';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import FastImage from 'react-native-fast-image';
import RazorpayCheckout from 'react-native-razorpay';
import {
  BannerAd,
  BannerAdSize,
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import Icon from 'react-native-vector-icons/MaterialIcons';
// Test Ad Unit IDs
const interstitialAdUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : 'your-interstitial-ad-unit-id';
const bannerAdUnitId = __DEV__ ? TestIds.BANNER : 'your-banner-ad-unit-id';

const Home = ({navigation}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [loadedAds, setLoadedAds] = useState(false);
  const [showContent, setShowContent] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const interstitialAd =
    InterstitialAd.createForAdRequest(interstitialAdUnitId);

  useEffect(() => {
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechResults = onSpeechResults;

    const unsubscribe = interstitialAd.addAdEventListener(
      AdEventType.LOADED,
      () => {
        console.log('Interstitial ad loaded');
        setLoadedAds(true);
      },
    );

    interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('Interstitial ad closed');
      setLoadedAds(false);
      navigation.navigate('Notes');
      setResult('');
    });

    interstitialAd.load();

    checkUserPremiumStatus();

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
      unsubscribe();
    };
  }, []);

  const checkUserPremiumStatus = async () => {
    const user = auth().currentUser;
    if (user) {
      const userRef = database().ref('users/' + user.uid);
      userRef.once('value', snapshot => {
        const userData = snapshot.val();
        if (userData && userData.userbuy === 'premium') {
          setIsPremium(true);
        }
      });
    }
  };

  const onSpeechStart = e => {
    console.log('onSpeechStart: ', e);
  };

  const onSpeechResults = e => {
    console.log('onSpeechResults: ', e);
    const speechResult = e.value && e.value.length > 0 ? e.value[0] : '';
    setResult(speechResult);
    setModalVisible(true); // Show modal when speech result is available
  };

  const startRecording = async () => {
    try {
      setResult('');
      await Voice.start('en-US');
      setIsRecording(true);
    } catch (e) {
      console.error(e);
    }
  };

  const stopRecording = async () => {
    try {
      await Voice.stop();
      setIsRecording(false);
    } catch (e) {
      console.error(e);
    }
  };

  const saveResultToFirebase = async text => {
    const user = auth().currentUser;
    if (user && text) {
      try {
        const notesRef = database().ref('users/' + user.uid + '/notes');
        const newNoteRef = notesRef.push();
        await newNoteRef.set({
          description: text,
          time: new Date().toLocaleString(),
        });
      } catch (error) {
        console.error('Error saving to Firebase:', error);
      }
    }
  };

  const handleSave = () => {
    saveResultToFirebase(result);
    if (interstitialAd.loaded && loadedAds === true && !isPremium) {
      interstitialAd.show();
    } else {
      console.log('Ad not loaded or user is premium');
      navigation.navigate('Notes');
    }
    setModalVisible(false);
  };

  const handleDiscard = () => {
    setModalVisible(false);
    setResult('');
  };

  const handleRazorpayCheckout = async () => {
    const user = auth().currentUser;
    if (user) {
      const options = {
        description: 'Upgrade to Premium',
        image: 'https://your-logo-url.png',
        currency: 'INR',
        key: 'rzp_test_Fy1TuMX7NckOL8',
        amount: '5000', // amount in paise
        name: 'audionotes',
        prefill: {
          email: user.email,
          contact: user.phoneNumber,
          name: user.displayName,
        },
        theme: {color: Colors.primary},
      };

      RazorpayCheckout.open(options)
        .then(data => {
          // handle success
          const userRef = database().ref('users/' + user.uid);
          userRef.update({userbuy: 'premium'});
          setIsPremium(true);
        })
        .catch(error => {
          // handle failure
          Alert('Payment failed');
          // console.error('Payment failed: ', error);
        });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={Colors.primary} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Voice To Text</Text>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 15}}>
            <TouchableOpacity
              onPress={() => navigation.navigate('VoiceRecord')}>
              <Icon name="mic" size={28} color="#31c55e" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleRazorpayCheckout}>
              {/* <Icon name="crown" size={28} color="#f5cd11" /> */}
              <Image
                source={ImagesAssets.king}
                style={{width: 30, height: 30, tintColor: '#f5cd11'}}
              />
            </TouchableOpacity>
          </View>
        </View>

        {showContent && (
          <View style={styles.content}>
            <View style={styles.recordingContainer}>
              {isRecording && (
                <Text style={styles.recordingText}>Recording...</Text>
              )}
              <TouchableOpacity
                style={styles.button}
                onPress={isRecording ? stopRecording : startRecording}>
                <Image source={ImagesAssets.spiker} style={styles.image} />
              </TouchableOpacity>
              <Text style={styles.promptText}>
                {isRecording
                  ? 'Recording in progress...'
                  : 'Press button to start recording'}
              </Text>
              <Text style={styles.languageText}>English (United States)</Text>
            </View>

            {isRecording && (
              <View style={styles.waveContainer}>
                <FastImage
                  source={ImagesAssets.spikerwave}
                  style={styles.waveImage}
                />
              </View>
            )}

            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => {
                setModalVisible(!modalVisible);
              }}>
              <View style={styles.modalContainer}>
                <View style={styles.modalView}>
                  <Text style={styles.resultText}>{result}</Text>
                  <View style={styles.buttonContainer}>
                    <Button
                      title="Save"
                      onPress={handleSave}
                      color={Colors.primary}
                    />
                    <Button
                      title="Discard"
                      onPress={handleDiscard}
                      color="gray"
                    />
                  </View>
                </View>
              </View>
            </Modal>

            {result !== '' && (
              <View style={styles.resultContainer}>
                <Text style={styles.resultText}>{result}</Text>
              </View>
            )}
          </View>
        )}

        {!isPremium && (
          <View style={styles.footer}>
            <BannerAd
              unitId={bannerAdUnitId}
              size={BannerAdSize.FULL_BANNER}
              requestOptions={{
                requestNonPersonalizedAdsOnly: true,
              }}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 21,
    fontWeight: '700',
    color: 'black',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  recordingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingText: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
    marginTop: 30,
  },
  button: {
    marginTop: 40,
  },
  image: {
    tintColor: Colors.primary,
  },
  promptText: {
    fontSize: 14,
    marginTop: 15,
  },
  languageText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'black',
    marginTop: 15,
  },
  waveContainer: {
    padding: 30,
    marginTop: 60,
    alignItems: 'center',
  },
  waveImage: {
    width: '100%',
    height: 70,
    tintColor: Colors.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    gap: 10,
    marginTop: 30,
  },
  resultContainer: {
    padding: 20,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 10,
  },
  resultText: {
    fontSize: 18,
    color: 'black',
  },
  footer: {
    justifyContent: 'flex-end',
    paddingBottom: 10,
  },
  toggleButton: {
    backgroundColor: Colors.primary,
    padding: 10,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: Colors.white,
    fontSize: 16,
  },
});

export default Home;
