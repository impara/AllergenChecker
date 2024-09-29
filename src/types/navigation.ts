// src/types/navigation.ts
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/core';

export type RootStackParamList = {
  Home: undefined;
  Scan: undefined;
  ProductInfo: {
    productInfo: any;
    detectedAllergens: string[];
    ingredientsList: string[];
  };
  Settings: undefined;
  AllergenProfile: undefined;
  Auth: undefined;
};

export type NavigationProp = StackNavigationProp<RootStackParamList>;
export type ProductInfoScreenRouteProp = RouteProp<RootStackParamList, 'ProductInfo'>;
