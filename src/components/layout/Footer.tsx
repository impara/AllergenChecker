import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Footer: React.FC = () => {
  return (
    <View style={styles.footer}>
      <Text style={styles.text}>© 2023 AllergenScan</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    height: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#333',
    fontSize: 12,
  },
});

export default Footer;