export interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  category: string;
  imageGradient: string;
  seller: string;
  rating: number;
  deliveryDays: number;
}

export interface SearchResult {
  query: string;
  language: string;
  intent: string;
  products: Product[];
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export type Page = "home" | "demo";
