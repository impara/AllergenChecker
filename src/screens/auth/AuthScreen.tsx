import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Button, TextInput, Title, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from 'styled-components/native';
import { 
  signInWithGoogleCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from '../../config/firebase';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import appLogo from '../../../assets/icons/icon.png';
import Toast from '../../components/Toast';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

// Define RootStackParamList here if it's not imported
type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  // ... other screens ...
};

type AuthScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Auth'>;

const AuthScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const navigation = useNavigation<AuthScreenNavigationProp>();
  const theme = useTheme();
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '640095529955-hsbineccga09hgc4c69mgshfv23dk84p.apps.googleusercontent.com',
    redirectUri: makeRedirectUri({
      native: 'com.foodallergyscanner://redirect',
    }),
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleSignIn(id_token);
    }
  }, [response]);

  const handleEmailAuth = async () => {
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(email, password);
        showToast('Account created successfully');
      } else {
        await signInWithEmailAndPassword(email, password);
        showToast('Signed in successfully');
      }
    } catch (error) {
      console.error('Auth error:', error);
      showToast('Authentication failed. Please try again.');
    }
  };

  const handleGoogleSignIn = async (idToken: string) => {
    try {
      await signInWithGoogleCredential(idToken);
      showToast('Signed in with Google successfully');
    } catch (error) {
      console.error('Error signing in with Google', error);
      showToast('Google Sign-In failed. Please try again.');
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Image source={appLogo} style={styles.logo} />
      <Title style={styles.title}>Welcome to AllergenScan</Title>
      <Text style={styles.subtitle}>
        Make safer food choices by scanning barcodes and checking for allergens
      </Text>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button mode="contained" onPress={handleEmailAuth} style={styles.button}>
        {isRegistering ? 'Sign Up' : 'Sign In'}
      </Button>
      <Button mode="outlined" onPress={() => promptAsync()} style={styles.button} disabled={!request}>
        Sign in with Google
      </Button>
      <Button mode="text" onPress={() => setIsRegistering(!isRegistering)} style={styles.switchButton}>
        {isRegistering ? 'Already have an account? Sign In' : 'Don\'t have an account? Sign Up'}
      </Button>
      <Toast
        message={toastMessage}
        isVisible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
  },
  switchButton: {
    marginTop: 20,
  },
});

export default AuthScreen;
