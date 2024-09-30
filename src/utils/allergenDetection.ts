// allergenDetection.ts

import nlp from 'compromise';
import Fuse from 'fuse.js';
import { AllergenProfile } from '../config/firebase';

export const parseIngredients = (ingredientsText: string): string[] => {
  console.log('Parsing ingredients text.');
  if (!ingredientsText) return [];

  // Normalize text: remove special characters, convert to lowercase
  const normalizedText = ingredientsText
    .toLowerCase()
    .replace(/[\(\)\[\]]/g, '')
    .replace(/[^a-zæøåäöüßœçñáéíóúàèìòùâêîôûæøå\-\,;.\s]/g, '');

  // Use compromise.js to process the text
  const doc = nlp(normalizedText);

  // Split ingredients by common delimiters
  const splitIngredients = doc
    .out('text')
    .split(/[,;.]/)
    .map((ingredient: string) => ingredient.trim())
    .filter((ingredient: string) => ingredient.length > 0);

  console.log('Split Ingredients:', splitIngredients);

  // Extract terms from each ingredient fragment
  let ingredients: string[] = [];
  splitIngredients.forEach((ingredient: string) => {
    const ingredientDoc = nlp(ingredient);

    // Split hyphenated words
    const terms = ingredientDoc
      .terms()
      .out('array')
      .flatMap((term: string) => term.split('-'));

    ingredients.push(...terms);
  });

  // Singularize terms and remove duplicates
  ingredients = ingredients.map((term) => nlp(term).nouns().toSingular().out('text'));
  ingredients = [...new Set(ingredients)].filter(Boolean);

  console.log('Parsed Ingredients:', ingredients);
  return ingredients;
};

export const unifiedDetectAllergens = (
  ingredientsList: string[],
  userAllergensData: AllergenProfile,
  apiAllergenTags: string[]
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

  // Detect allergens from API tags
  apiAllergenTags.forEach((tag) => {
    const allergen = tag.replace(/^en:/, '').toLowerCase();
    if (normalizedUserAllergens[allergen]?.selected) {
      detected.add(allergen);
      console.log(`Allergen detected from API tags: ${allergen}`);
    }
  });

  // Prepare allergen list for Fuse.js
  const userAllergenList = Object.keys(normalizedUserAllergens).filter(
    (allergen) => normalizedUserAllergens[allergen].selected
  );

  // Set up Fuse.js for fuzzy matching with substring matching
  const fuseOptions = {
    includeScore: true,
    threshold: 0.3, // Adjust based on desired sensitivity
    useExtendedSearch: true,
  };
  const fuse = new Fuse(userAllergenList, fuseOptions);

  // Process ingredients with compromise.js
  const ingredientsText = ingredientsList.join(', ');
  const doc = nlp(ingredientsText);

  // Extract terms from ingredients
  const ingredientTerms = doc
    .terms()
    .out('array')
    .flatMap((term: string) => term.split('-')); // Split hyphenated terms

  console.log('Extracted Ingredient Terms:', ingredientTerms);

  // Singularize terms for better matching
  const singularTerms = ingredientTerms.map((term: string) =>
    nlp(term).nouns().toSingular().out('text')
  );

  // Remove duplicates
  const uniqueTerms = [...new Set(singularTerms)];

  console.log('Unique Singular Terms:', uniqueTerms);

  // Detect allergens from ingredients using Fuse.js with substring matching
  uniqueTerms.forEach((term) => {
    userAllergenList.forEach((allergen) => {
      if (typeof term === 'string' && term.includes(allergen)) {
        detected.add(allergen);
        console.log(`Allergen detected from ingredients (substring match): ${allergen}`);
      } else {
        // Use Fuse.js fuzzy matching
        const results = fuse.search(`'${term}`);
        if (results.length > 0) {
          results.forEach((result) => {
            const matchedAllergen = result.item;
            detected.add(matchedAllergen);
            console.log(`Allergen detected from ingredients (fuzzy match): ${matchedAllergen}`);
          });
        }
      }
    });
  });

  const detectedArray = Array.from(detected);
  console.log('Final Detected Allergens:', detectedArray);
  return detectedArray;
};
