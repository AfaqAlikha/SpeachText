import React, {useEffect} from 'react';
import {View, Image, StyleSheet, StatusBar} from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import Colors from '../colors/Colors';
import {ImagesAssets} from '../assets/ImagesAssets';
import auth from '@react-native-firebase/auth';

const Splash = ({navigation}) => {
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      SplashScreen.hide();
      setTimeout(() => {
        if (user) {
          navigation.replace('Drawer'); // Navigate to Drawer if user is logged in
        } else {
          navigation.replace('Login'); // Navigate to Login if user is not logged in
        }
      }, 2000); // Delay for 2 seconds
    });

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={Colors.primary} />
      <Image
        source={ImagesAssets.logoApp}
        style={{width: 150, height: 150, tintColor: 'white'}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
});

export default Splash;
