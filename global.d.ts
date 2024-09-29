declare module 'firebase/app';
declare module 'firebase/auth';
declare module 'firebase/firestore';
declare module '@react-navigation/native';
declare module '@react-navigation/stack';
declare module 'react-native-gesture-handler';
declare module 'styled-components/native';
declare module 'expo-barcode-scanner';
declare module 'react-native-paper';
declare module 'expo-auth-session/providers/google';
declare module 'expo-web-browser';

// Removed the custom 'expo-camera' module declaration
// declare module 'expo-camera' {
//   // ... custom type definitions
// }

import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  ProductInfo: { barcode: string };
  AllergenProfile: undefined;
  Scan: undefined;
  Settings: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

declare module 'react-native-vector-icons/MaterialIcons' {
  import { Icon } from 'react-native-vector-icons/MaterialIcons';
  export default Icon;
}
