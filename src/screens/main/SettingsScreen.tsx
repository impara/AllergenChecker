import React, { useState } from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { List, Switch, Title, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInLeft, AnimateProps } from 'react-native-reanimated';
import { signOut } from '../../config/firebase';
import { NavigationProp } from '../../types/navigation';

// Define interface for AnimatedView
interface AnimatedViewProps extends AnimateProps<ViewProps> {
  children: React.ReactNode;
}

// Create AnimatedView with proper typing
const AnimatedView = Animated.createAnimatedComponent(View) as React.ComponentType<AnimatedViewProps>;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleLogout = async () => {
    try {
      await signOut();
      navigation.navigate('Auth');
    } catch (error) {
      console.error('Error signing out:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <View style={styles.container}>

      <AnimatedView entering={FadeInLeft.duration(500).springify()}>
        <List.Item
          title="Dark Mode"
          right={() => (
            <Switch value={darkMode} onValueChange={setDarkMode} />
          )}
        />
      </AnimatedView>

      <AnimatedView entering={FadeInLeft.delay(200).duration(500).springify()}>
        <List.Item
          title="Notifications"
          right={() => (
            <Switch value={notifications} onValueChange={setNotifications} />
          )}
        />
      </AnimatedView>

      <AnimatedView entering={FadeInLeft.delay(400).duration(500).springify()}>
        <List.Item
          title="About"
          onPress={() => {
            /* Navigate to About screen */
          }}
        />
      </AnimatedView>

      <AnimatedView entering={FadeInLeft.delay(600).duration(500).springify()}>
        <List.Item
          title="Privacy Policy"
          onPress={() => {
            /* Navigate to Privacy Policy screen */
          }}
        />
      </AnimatedView>

      <AnimatedView entering={FadeInLeft.delay(800).duration(500).springify()}>
        <Button 
          mode="outlined" 
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          Logout
        </Button>
      </AnimatedView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f0f0', // You can adjust this based on your theme
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  logoutButton: {
    marginTop: 20,
  },
});

export default SettingsScreen;