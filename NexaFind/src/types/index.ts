// types for our solr product data

export interface ProductItem {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  rating: number;
  in_stock: boolean;
  tags: string[];
  date_added: string;
}

// highlighting stuff from solr response
export interface HighlightData {
  [docId: string]: {
    name?: string[];
    description?: string[];
  };
}

export interface FacetEntry {
  value: string;
  count: number;
}

// search filter params we pass around
export interface QueryFilters {
  q: string;
  category: string[];
  brand: string[];
  minPrice: string;
  maxPrice: string;
  inStock: string;
  sort: string;
  page: string;
}

// what the api returns back to us
export interface QueryResult {
  results: ProductItem[];
  totalResults: number;
  page: number;
  totalPages: number;
  highlighting: HighlightData;
  facets: {
    category: FacetEntry[];
    brand: FacetEntry[];
  };
}

export interface AutocompleteResult {
  suggestions: string[];
}
