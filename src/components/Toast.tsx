import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from 'styled-components/native';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onHide: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, isVisible, onHide }) => {
  const theme = useTheme();
  const opacity = new Animated.Value(0);

  useEffect(() => {
    if (isVisible) {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => onHide());
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.container, { opacity, backgroundColor: theme.colors.primary }]} >
      <Text style={[styles.message, { color: theme.colors.background }]}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
  },
});

export default Toast;