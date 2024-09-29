// src/screens/main/ProductInfoScreen.tsx

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Chip, Divider, IconButton } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

type Params = {
  productInfo: any;
  detectedAllergens: string[];
  ingredientsList: string[];
};

const ProductInfoScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<Record<string, Params>, string>>();
  const { productInfo: product, detectedAllergens, ingredientsList } = route.params;

  console.log('Displaying Product Info:', product);

  const productName = product.product_name || product.name || 'Unnamed Product';
  const productBrand = product.brands || product.brand || 'Unknown Brand';

  const countries =
    product.countries_tags ||
    (product.country ? [product.country] : []) ||
    product.countries ||
    [];

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>{productName}</Text>
          <Text style={styles.subtitle}>{productBrand}</Text>

          {countries.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Countries:</Text>
              <Text>{countries.join(', ').replace(/en:/g, '')}</Text>
            </>
          )}

          <Text style={styles.sectionTitle}>Ingredients:</Text>
          {ingredientsList.length > 0 ? (
            <Text>{ingredientsList.join(', ')}</Text>
          ) : (
            <Text style={styles.warningText}>
              Ingredients information is unavailable for this product.
            </Text>
          )}

          <Text style={styles.sectionTitle}>Detected Allergens:</Text>
          {detectedAllergens.length > 0 ? (
            <View style={styles.allergenContainer}>
              {detectedAllergens.map((allergen, index) => (
                <Chip key={index} style={styles.allergenChip}>
                  {allergen}
                </Chip>
              ))}
            </View>
          ) : (
            <Text>No allergens detected based on your profile.</Text>
          )}

          <View
            style={[
              styles.safetyContainer,
              detectedAllergens.length > 0 ? styles.unsafeContainer : styles.safeContainer,
            ]}
          >
            <IconButton
              icon={detectedAllergens.length === 0 ? 'check-circle' : 'alert-circle'}
              size={40}
              color={detectedAllergens.length === 0 ? '#4CAF50' : '#F44336'}
            />
            <View style={styles.safetyTextContainer}>
              <Text
                style={[
                  styles.safetyTitle,
                  detectedAllergens.length > 0 ? styles.unsafeTitle : styles.safeTitle,
                ]}
              >
                {detectedAllergens.length === 0 ? 'Safe to Consume' : 'Not Safe'}
              </Text>
              <Text style={styles.safetyDescription}>
                {detectedAllergens.length === 0
                  ? 'This product is safe based on your allergen profile.'
                  : 'This product contains allergens you should avoid.'}
              </Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <Text style={styles.sectionTitle}>Nutritional Information:</Text>
          {product.nutriments ? (
            <View>
              <Text>
                Calories: {product.nutriments['energy-kcal'] || 'N/A'}{' '}
                {product.nutriments['energy-kcal_unit'] || ''}
              </Text>
              <Text>Protein: {product.nutriments.proteins || 'N/A'}g</Text>
              <Text>Carbs: {product.nutriments.carbohydrates || 'N/A'}g</Text>
              <Text>Fat: {product.nutriments.fat || 'N/A'}g</Text>
            </View>
          ) : (
            <Text>Nutritional information not available.</Text>
          )}
        </Card.Content>
      </Card>

      <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.button}>
        Back to Scan
      </Button>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  allergenContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  allergenChip: {
    margin: 4,
    backgroundColor: '#FFE0E0',
  },
  button: {
    marginVertical: 8,
  },
  safetyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
  },
  safeContainer: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  unsafeContainer: {
    borderWidth: 2,
    borderColor: '#F44336',
  },
  safetyTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  safetyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  safeTitle: {
    color: '#4CAF50',
  },
  unsafeTitle: {
    color: '#F44336',
  },
  safetyDescription: {
    fontSize: 14,
    color: '#757575',
  },
  warningText: {
    color: 'orange',
    fontStyle: 'italic',
  },
});

export default ProductInfoScreen;
