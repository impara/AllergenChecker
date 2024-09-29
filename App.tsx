// App.tsx

import 'react-native-gesture-handler';

import React, { useState, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { ThemeProvider } from 'styled-components/native';
import { theme, navigationTheme } from './src/theme/index';
import { auth } from './src/config/firebase';

import AuthScreen from './src/screens/auth/AuthScreen';
import AllergenProfileScreen from './src/screens/main/AllergenProfileScreen';
import SettingsScreen from './src/screens/main/SettingsScreen';
import ProductInfoScreen from './src/screens/main/ProductInfoScreen';
import HomeScreen from './src/screens/main/HomeScreen';
import ScanScreen from './src/screens/main/ScanScreen';

const Stack = createStackNavigator();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });

    return unsubscribe;
  }, []);

  if (isAuthenticated === null) {
    return null; // Loading screen logic
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
      <ThemeProvider theme={theme}>
        <NavigationContainer theme={navigationTheme}>
          <Stack.Navigator
            initialRouteName={isAuthenticated ? "Home" : "Auth"}
            screenOptions={{
              headerStyle: { backgroundColor: theme.colors.primary },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' },
            }}
          >
            {isAuthenticated ? (
              <>
                <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'AllergenScan' }} />
                <Stack.Screen name="Scan" component={ScanScreen} />
                <Stack.Screen name="ProductInfo" component={ProductInfoScreen} options={{ title: 'Product Information' }} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
                <Stack.Screen name="AllergenProfile" component={AllergenProfileScreen} options={{ title: 'My Allergen Profile' }} />
              </>
            ) : (
              <Stack.Screen name="Auth" component={AuthScreen} options={{ title: 'Authentication' }} />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

export default App;
