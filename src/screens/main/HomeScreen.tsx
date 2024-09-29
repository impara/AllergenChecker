// src/screens/main/HomeScreen.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Scan: undefined;
  Settings: undefined;
  AllergenProfile: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('Scan')}
        style={styles.button}
      >
        Scan Product
      </Button>
      <Button
        mode="outlined"
        onPress={() => navigation.navigate('Settings')}
        style={styles.button}
      >
        Settings
      </Button>
      <Button
        mode="outlined"
        onPress={() => navigation.navigate('AllergenProfile')}
        style={styles.button}
      >
        Allergen Profile
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  button: {
    marginVertical: 8,
  },
});

export default HomeScreen;
