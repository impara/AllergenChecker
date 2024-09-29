export interface ProductInfo {
  code: string;
  product: {
    product_name: string;
    brands: string;
    ingredients_text_en?: string;
    ingredients_text?: string;
    allergens_tags?: string[];
    allergens_from_ingredients?: string;
    allergens_hierarchy?: string[];
    nutriments?: {
      'energy-kcal'?: number;
      proteins?: number;
      carbohydrates?: number;
      fat?: number;
      // Add other nutriments as needed
    };
    description?: string;
    // Add other relevant fields
  };
  status: number;
  status_verbose: string;
}

export interface AlternateProductInfo {
  product: {
    id: number;
    barcode: string;
    country: string;
    name: string;
    ingredients_text?: string;
    allergens_tags?: string[];
    images?: { medium?: string }[];
    // Add other relevant fields
  };
}
