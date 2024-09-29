import { AllergenProfile } from '../config/firebase';

export const unifiedDetectAllergens = (
  ingredientsList: string[],
  userAllergensData: AllergenProfile,
  allergensTags: string[]
): string[] => {
  console.log('Starting allergen detection.');
  const detected = new Set<string>();

  const normalizedUserAllergens = Object.keys(userAllergensData).reduce(
    (acc, key) => {
      acc[key.toLowerCase()] = userAllergensData[key];
      return acc;
    },
    {} as { [key: string]: typeof userAllergensData[string] }
  );

  console.log('Normalized User Allergens:', normalizedUserAllergens);

  // Handle allergensTags, which might be empty
  allergensTags.forEach((tag) => {
    const allergen = tag.replace(/^en:/, '').toLowerCase();
    if (normalizedUserAllergens[allergen]?.selected) {
      detected.add(allergen);
      console.log(`Allergen detected from tags: ${allergen}`);
    }
  });

  // Detect allergens from ingredients list
  ingredientsList.forEach((ingredient) => {
    const ingredientLower = ingredient.toLowerCase();
    Object.keys(normalizedUserAllergens).forEach((allergen) => {
      if (normalizedUserAllergens[allergen].selected) {
        const regex = new RegExp(`\\b${allergen}\\b`, 'i');
        if (regex.test(ingredientLower)) {
          detected.add(allergen);
          console.log(`Allergen detected from ingredients: ${allergen}`);
        }
      }
    });
  });

  const detectedArray = Array.from(detected);
  console.log('Final Detected Allergens:', detectedArray);
  return detectedArray;
};
