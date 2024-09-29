// src/screens/main/ScanScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
  Animated,
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useNavigation } from '@react-navigation/native';
import {
  getOpenFoodFactsProductInfo,
  getAlternateProductInfo,
  parseIngredients,
} from '../../services/api';
import { getUserAllergens, AllergenProfile } from '../../config/firebase';
import { NavigationProp } from '../../types/navigation';
import { unifiedDetectAllergens } from '../../utils/allergenDetection';
import { ProductInfo, AlternateProductInfo } from '../../types/ProductInfo';

const ScanScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [userAllergens, setUserAllergens] = useState<AllergenProfile>({});

  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const allergens = await getUserAllergens();
      const normalizedAllergens = Object.keys(allergens).reduce((acc, key) => {
        acc[key.toLowerCase()] = allergens[key];
        return acc;
      }, {} as AllergenProfile);
      setUserAllergens(normalizedAllergens);
      console.log('User Allergens:', normalizedAllergens);
    })();
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [scaleAnim]);

  const handleBarCodeScanned = async ({
    data,
    type,
  }: {
    data: string;
    type: string;
  }) => {
    if (scanned || loading) return;

    console.log(`Barcode scanned! Type: ${type}, Data: ${data}`);
    setScanned(true);
    setLoading(true);

    try {
      let productInfo: ProductInfo | null = null;
      let alternateProductInfo: AlternateProductInfo | null = null;

      try {
        console.log('Fetching product info from OpenFoodFacts...');
        const fetchedProductInfo = await getOpenFoodFactsProductInfo(data);
        productInfo = fetchedProductInfo;
        console.log('Fetched product info from OpenFoodFacts!');
      } catch (error: any) {
        console.log('OpenFoodFacts Error:', error.message);
        productInfo = null;
      }

      if (productInfo) {
        const ingredientsText =
          productInfo.product.ingredients_text_en || productInfo.product.ingredients_text;
        if (ingredientsText) {
          console.log('Ingredients found in OpenFoodFacts.');
          await processProductInfo(productInfo);
          return;
        } else {
          console.log('Ingredients missing in OpenFoodFacts, attempting alternate source.');
          try {
            console.log('Fetching product info from FoodRepo...');
            alternateProductInfo = await getAlternateProductInfo(data);
            console.log('Fetched product info from FoodRepo!');
            const alternateIngredientsText = alternateProductInfo.product.ingredients_text;
            if (alternateIngredientsText) {
              console.log('Ingredients found in FoodRepo.');
              await processAlternateProductInfo(alternateProductInfo);
              return;
            } else {
              console.log('Ingredients missing in FoodRepo.');
              handleMissingIngredients(productInfo, alternateProductInfo);
              return;
            }
          } catch (error: any) {
            console.log('FoodRepo Error:', error.message);
            handleMissingIngredients(productInfo, null);
            return;
          }
        }
      }

      try {
        console.log('Product not found in OpenFoodFacts, attempting FoodRepo...');
        alternateProductInfo = await getAlternateProductInfo(data);
        console.log('Fetched product info from FoodRepo!');
        const alternateIngredientsText = alternateProductInfo.product.ingredients_text;
        if (alternateIngredientsText) {
          console.log('Ingredients found in FoodRepo.');
          await processAlternateProductInfo(alternateProductInfo);
          return;
        } else {
          console.log('Ingredients missing in FoodRepo.');
          handleMissingIngredients(null, alternateProductInfo);
          return;
        }
      } catch (error: any) {
        console.log('FoodRepo Error:', error.message);
        Alert.alert(
          'Product Not Found',
          'This barcode is not recognized in any database.'
        );
      }
    } catch (error) {
      console.log('Unexpected Error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => setScanned(false), 5000);
    }
  };

  const handleMissingIngredients = (
    productInfo: ProductInfo | null,
    alternateProductInfo: AlternateProductInfo | null
  ) => {
    console.log('Handling missing ingredients.');

    Alert.alert(
      'Allergen Information Unavailable',
      'Ingredient details for this product are missing. Therefore, we cannot determine the presence of allergens. Please exercise caution and consider verifying the information from the product packaging or manufacturer.',
      [
        {
          text: 'Scan Next',
          onPress: () => {
            setScanned(false);
          },
        },
        {
          text: 'View Details',
          onPress: () => {
            console.log('Navigating to ProductInfo with missing ingredients.');
            const product = productInfo
              ? productInfo.product
              : alternateProductInfo
              ? alternateProductInfo.product
              : {};
            navigation.navigate('ProductInfo', {
              productInfo: product,
              detectedAllergens: [],
              ingredientsList: [],
            });
          },
        },
      ]
    );
    setLoading(false);
  };

  const processProductInfo = async (productInfo: ProductInfo) => {
    console.log('Processing product info from OpenFoodFacts.');
    const userAllergensData: AllergenProfile = userAllergens;

    const allergensTags: string[] = productInfo.product.allergens_tags || [];
    const allergensFromIngredients: string[] = productInfo.product.allergens_from_ingredients
      ? productInfo.product.allergens_from_ingredients
          .split(',')
          .map((tag: string) => tag.trim().toLowerCase())
      : [];
    const allergensHierarchy: string[] = productInfo.product.allergens_hierarchy || [];

    let combinedAllergens = [
      ...new Set([...allergensTags, ...allergensFromIngredients, ...allergensHierarchy]),
    ];
    combinedAllergens = combinedAllergens
      .map((tag: string) => tag.trim().toLowerCase())
      .map((tag: string) =>
        tag.startsWith('en:') ? tag.replace('en:', '').toLowerCase() : tag
      )
      .filter((tag: string) => tag.length > 0);
    console.log('Combined Allergens:', combinedAllergens);

    const ingredientsText =
      productInfo.product.ingredients_text_en || productInfo.product.ingredients_text;
    console.log('Ingredients Text:', ingredientsText);

    let ingredientsList: string[] = [];
    if (ingredientsText) {
      ingredientsList = parseIngredients(ingredientsText);
      console.log('Parsed Ingredients List:', ingredientsList);
    }

    const finalDetectedAllergens = unifiedDetectAllergens(
      ingredientsList,
      userAllergensData,
      combinedAllergens
    );

    navigation.navigate('ProductInfo', {
      productInfo: productInfo.product,
      detectedAllergens: finalDetectedAllergens,
      ingredientsList,
    });
  };

  const processAlternateProductInfo = async (alternateProductInfo: AlternateProductInfo) => {
    console.log('Processing product info from FoodRepo.');
    const userAllergensData: AllergenProfile = userAllergens;

    const ingredientsText = alternateProductInfo.product.ingredients_text;
    console.log('Ingredients Text:', ingredientsText);

    let ingredientsList: string[] = [];
    if (ingredientsText) {
      ingredientsList = parseIngredients(ingredientsText);
      console.log('Parsed Ingredients List:', ingredientsList);
    }

    // Since we don't have allergens_tags from FoodRepo, pass an empty array
    const finalDetectedAllergens = unifiedDetectAllergens(
      ingredientsList,
      userAllergensData,
      [] // No allergens_tags from FoodRepo
    );

    navigation.navigate('ProductInfo', {
      productInfo: alternateProductInfo.product,
      detectedAllergens: finalDetectedAllergens,
      ingredientsList,
    });
  };

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <Text>Requesting camera permission...</Text>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Text>No access to camera.</Text>
        <Text onPress={() => Linking.openSettings()} style={styles.link}>
          Open Settings
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.instructions}>
        Point your camera at a product barcode to scan
      </Text>
      <BarCodeScanner
        onBarCodeScanned={handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
        barCodeTypes={[
          BarCodeScanner.Constants.BarCodeType.ean13,
          BarCodeScanner.Constants.BarCodeType.ean8,
          BarCodeScanner.Constants.BarCodeType.upc_a,
          BarCodeScanner.Constants.BarCodeType.upc_e,
        ]}
      />
      <View style={styles.overlay}>
        <Animated.View
          style={[styles.targetBox, { transform: [{ scale: scaleAnim }] }]}
        />
      </View>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}
      {Platform.OS === 'web' && (
        <View style={styles.webButtonContainer}>
          <Button
            mode="contained"
            onPress={() => {
              handleBarCodeScanned({
                data: '5705830607720',
                type: 'ean13',
              });
            }}
            disabled={loading}
            style={styles.button}
          >
            {loading ? 'Loading...' : 'Simulate Scan'}
          </Button>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  link: {
    marginTop: 10,
    color: 'blue',
    textDecorationLine: 'underline',
  },
  container: {
    flex: 1,
  },
  instructions: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    alignSelf: 'center',
    textAlign: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 20,
    zIndex: 2,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  targetBox: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#00FF00',
    backgroundColor: 'transparent',
    borderRadius: 12,
    shadowColor: '#00FF00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 5,
  },
  loadingOverlay: {
    position: 'absolute',
    top: '50%',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
    borderRadius: 10,
    alignSelf: 'center',
    zIndex: 3,
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
  },
  webButtonContainer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    zIndex: 2,
  },
  button: {
    margin: 16,
    width: 200,
  },
});

export default ScanScreen;
