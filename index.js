/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/storage';
import '@react-native-firebase/database';

AppRegistry.registerComponent(appName, () => App);
