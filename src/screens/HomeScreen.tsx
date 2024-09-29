import React from 'react';
import { View, ViewProps } from 'react-native';
import { Button, Title } from 'react-native-paper';
import styled from 'styled-components/native';
import Animated, { FadeInDown, AnimateProps } from 'react-native-reanimated';
import { NavigationProp } from '../types/navigation';
import { DefaultTheme } from 'styled-components';

const Container = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${(props: { theme: DefaultTheme }) => props.theme.colors.background};
`;

const StyledButton = styled(Button)`
  margin: 10px;
  width: 200px;
`;

// Define a custom interface that includes 'children'
interface AnimatedViewProps extends AnimateProps<ViewProps> {
  children?: React.ReactNode;
}

// Cast AnimatedView to use the custom interface
const AnimatedView = Animated.createAnimatedComponent(View) as React.ComponentType<AnimatedViewProps>;

const HomeScreen = ({ navigation }: { navigation: NavigationProp }) => {
  return (
    <Container>
      <AnimatedView entering={FadeInDown.duration(1000).springify()}>
        <Title>Welcome to AllergenScan</Title>
      </AnimatedView>
      <AnimatedView entering={FadeInDown.delay(300).duration(1000).springify()}>
        <StyledButton mode="contained" onPress={() => navigation.navigate('Scan')}>
          Scan Product
        </StyledButton>
      </AnimatedView>
      <AnimatedView entering={FadeInDown.delay(600).duration(1000).springify()}>
        <StyledButton mode="outlined" onPress={() => navigation.navigate('AllergenProfile')}>
          Allergen Profile
        </StyledButton>
      </AnimatedView>
      <AnimatedView entering={FadeInDown.delay(900).duration(1000).springify()}>
        <StyledButton mode="outlined" onPress={() => navigation.navigate('Settings')}>
          Settings
        </StyledButton>
      </AnimatedView>
    </Container>
  );
};

export default HomeScreen;
