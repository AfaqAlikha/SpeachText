import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import {createStackNavigator} from '@react-navigation/stack';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
import auth from '@react-native-firebase/auth';

import Login from './src/components/authentication/Login';
import Signup from './src/components/authentication/Signup';
import Home from './src/screens/Home';
import Splash from './src/screens/SplashScreen';
import Colors from './src/colors/Colors';
import Profile from './src/screens/Profile';
import Subscription from './src/screens/Subscription';
import VoiceList from './src/screens/VoiceList';
import UserNotes from './src/screens/UserNotes';
import {ImagesAssets} from './src/assets/ImagesAssets';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  faHome,
  faUser,
  faCreditCard,
  faSignOutAlt,
  faFile,
} from '@fortawesome/free-solid-svg-icons';
import PrivcePolice from './src/screens/PrivcePolice';
const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// Custom Drawer Content Component
function CustomDrawerContent(props) {
  const handleLogout = () => {
    auth()
      .signOut()
      .then(() => {
        props.navigation.navigate('Login');
      })
      .catch(error => {
        console.error('Error logging out: ', error);
      });
  };

  const shareContent = async () => {
    try {
      const result = await Share.open({
        title: 'Share',
        message: 'Check out this amazing app!',
        url: 'https://yourapp.com',
      });
      console.log('Share result:', result);
    } catch (error) {
      console.error('Share error:', error);
    }
  };
  return (
    <DrawerContentScrollView {...props}>
      {/* Logo or Image Section */}
      <View style={styles.drawerHeader}>
        <Image source={ImagesAssets.logoApp} style={styles.logo} />
        <Text style={{fontSize: 22, fontWeight: '800', color: Colors.primary}}>
          SpeechText
        </Text>
      </View>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Shear App"
        icon={({color, size}) => (
          <Icon name="share-square" size={size} color={color} />
        )}
        onPress={shareContent}
      />
      <DrawerItem
        label="Logout"
        icon={({color, size}) => (
          <FontAwesomeIcon icon={faSignOutAlt} size={size} color={color} />
        )}
        onPress={handleLogout}
      />
    </DrawerContentScrollView>
  );
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.white,
        drawerActiveBackgroundColor: Colors.primary,
        drawerActiveTintColor: Colors.white,
      }}>
      <Drawer.Screen
        name="Home"
        component={Home}
        options={{
          drawerIcon: ({color, size}) => (
            <FontAwesomeIcon icon={faHome} size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Notes"
        component={UserNotes}
        options={{
          drawerIcon: ({color, size}) => (
            <FontAwesomeIcon icon={faFile} size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={Profile}
        options={{
          drawerIcon: ({color, size}) => (
            <FontAwesomeIcon icon={faUser} size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="PrivecePolice"
        component={PrivcePolice}
        options={{
          drawerIcon: ({color, size}) => (
            <FontAwesomeIcon icon={faUser} size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Subscription"
        component={Subscription}
        options={{
          drawerIcon: ({color, size}) => (
            <FontAwesomeIcon icon={faCreditCard} size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

function App() {
  return (
    <NavigationContainer>
      <StatusBar />
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen
          name="Splash"
          component={Splash}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Signup"
          component={Signup}
          options={{headerShown: false}}
        />

        <Stack.Screen
          name="VoiceRecord"
          component={VoiceList}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Drawer"
          component={DrawerNavigator}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  logo: {
    width: 90,
    height: 90,
  },
});

export default App;
