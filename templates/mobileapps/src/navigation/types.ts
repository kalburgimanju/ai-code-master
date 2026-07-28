import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabScreenProps, BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { NativeStackRouteProp, BottomTabRouteProp } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  VerifyOTP: { email?: string; phone?: string; type: 'email' | 'phone' };
};

// Main Tabs
export type MainTabParamList = {
  Home: undefined;
  Products: { section?: string; categoryId?: string } | undefined;
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
};

// Home Stack (nested in Home tab)
export type HomeStackParamList = {
  Home: undefined;
  Search: { showFilters?: boolean; initialQuery?: string } | undefined;
  Categories: { categoryId?: string; categoryName?: string } | undefined;
  ProductDetail: { productId: string; sellerId?: string } | undefined;
};

// Products Stack (nested in Products tab)
export type ProductsStackParamList = {
  Products: { section?: string; categoryId?: string } | undefined;
  ProductDetail: { productId: string; sellerId?: string } | undefined;
  Categories: { categoryId?: string; categoryName?: string } | undefined;
  Search: { showFilters?: boolean; initialQuery?: string } | undefined;
};

// Cart Stack (nested in Cart tab)
export type CartStackParamList = {
  Cart: undefined;
  Checkout: { fromCart?: boolean; buyNowProduct?: string } | undefined;
};

// Orders Stack (nested in Orders tab)
export type OrdersStackParamList = {
  Orders: undefined;
  OrderDetail: { orderId: string } | undefined;
};

// Profile Stack (nested in Profile tab)
export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
  Wishlist: undefined;
  Notifications: undefined;
  Chat: { conversationId?: string } | undefined;
  Wallet: undefined;
  Referral: undefined;
  Help: undefined;
  About: undefined;
};

// Seller Stack (conditional)
export type SellerStackParamList = {
  SellerDashboard: undefined;
  AddProduct: { productId?: string } | undefined;
  ManageProducts: { status?: 'active' | 'inactive' | 'draft' } | undefined;
  SellerOrders: { status?: string } | undefined;
  SellerAnalytics: { period?: 'week' | 'month' | 'quarter' | 'year' } | undefined;
  SellerProfile: undefined;
};

// Main Stack (after auth)
export type MainStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  ProductDetail: { productId: string; sellerId?: string } | undefined;
  Categories: { categoryId?: string; categoryName?: string } | undefined;
  Search: { showFilters?: boolean; initialQuery?: string } | undefined;
  Cart: undefined;
  Checkout: { fromCart?: boolean; buyNowProduct?: string } | undefined;
  Orders: undefined;
  OrderDetail: { orderId: string } | undefined;
  Profile: undefined;
  Settings: undefined;
  Wishlist: undefined;
  Notifications: undefined;
  Chat: { conversationId?: string } | undefined;
  Wallet: undefined;
  Referral: undefined;
  Help: undefined;
  About: undefined;
  // Seller screens (conditional)
  SellerDashboard: undefined;
  AddProduct: { productId?: string } | undefined;
  ManageProducts: { status?: 'active' | 'inactive' | 'draft' } | undefined;
  SellerOrders: { status?: string } | undefined;
  SellerAnalytics: { period?: 'week' | 'month' | 'quarter' | 'year' } | undefined;
  SellerProfile: undefined;
};

// Root Stack (before auth)
export type RootStackParamList = {
  Onboarding: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
};

// Navigation Props Types
export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;

export type AuthStackScreenProps<Screen extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, Screen>;

export type MainStackScreenProps<Screen extends keyof MainStackParamList> =
  NativeStackScreenProps<MainStackParamList, Screen>;

export type MainTabScreenProps<Screen extends keyof MainTabParamList> =
  BottomTabScreenProps<MainTabParamList, Screen>;

export type HomeStackScreenProps<Screen extends keyof HomeStackParamList> =
  NativeStackScreenProps<HomeStackParamList, Screen>;

export type ProductsStackScreenProps<Screen extends keyof ProductsStackParamList> =
  NativeStackScreenProps<ProductsStackParamList, Screen>;

export type CartStackScreenProps<Screen extends keyof CartStackParamList> =
  NativeStackScreenProps<CartStackParamList, Screen>;

export type OrdersStackScreenProps<Screen extends keyof OrdersStackParamList> =
  NativeStackScreenProps<OrdersStackParamList, Screen>;

export type ProfileStackScreenProps<Screen extends keyof ProfileStackParamList> =
  NativeStackScreenProps<ProfileStackParamList, Screen>;

export type SellerStackScreenProps<Screen extends keyof SellerStackParamList> =
  NativeStackScreenProps<SellerStackParamList, Screen>;

// Navigation Prop Types for hooks
export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type AuthStackNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
export type MainStackNavigationProp = NativeStackNavigationProp<MainStackParamList>;
export type MainTabNavigationProp = BottomTabNavigationProp<MainTabParamList>;
export type HomeStackNavigationProp = NativeStackNavigationProp<HomeStackParamList>;
export type ProductsStackNavigationProp = NativeStackNavigationProp<ProductsStackParamList>;
export type CartStackNavigationProp = NativeStackNavigationProp<CartStackParamList>;
export type OrdersStackNavigationProp = NativeStackNavigationProp<OrdersStackParamList>;
export type ProfileStackNavigationProp = NativeStackNavigationProp<ProfileStackParamList>;
export type SellerStackNavigationProp = NativeStackNavigationProp<SellerStackParamList>;

// Route Prop Types
export type RootStackRouteProp<Screen extends keyof RootStackParamList> = NativeStackRouteProp<RootStackParamList, Screen>;
export type AuthStackRouteProp<Screen extends keyof AuthStackParamList> = NativeStackRouteProp<AuthStackParamList, Screen>;
export type MainStackRouteProp<Screen extends keyof MainStackParamList> = NativeStackRouteProp<MainStackParamList, Screen>;
export type MainTabRouteProp<Screen extends keyof MainTabParamList> = BottomTabRouteProp<MainTabParamList, Screen>;

// Deep Linking Config
export const linkingConfig = {
  prefixes: ['mobileapps://', 'https://mobileapps.app', 'https://www.mobileapps.app'],
  config: {
    screens: {
      Onboarding: 'onboarding',
      Auth: {
        screens: {
          Login: 'login',
          Register: 'register',
          ForgotPassword: 'forgot-password',
          VerifyOTP: 'verify-otp',
        },
      },
      Main: {
        screens: {
          MainTabs: {
            screens: {
              Home: {
                screens: {
                  Home: 'home',
                  Search: 'search',
                  Categories: 'categories/:categoryId?',
                  ProductDetail: 'product/:productId',
                },
              },
              Products: {
                screens: {
                  Products: 'products/:section?',
                  ProductDetail: 'product/:productId',
                  Categories: 'categories/:categoryId?',
                  Search: 'search',
                },
              },
              Cart: {
                screens: {
                  Cart: 'cart',
                  Checkout: 'checkout',
                },
              },
              Orders: {
                screens: {
                  Orders: 'orders',
                  OrderDetail: 'orders/:orderId',
                },
              },
              Profile: {
                screens: {
                  Profile: 'profile',
                  Settings: 'settings',
                  Wishlist: 'wishlist',
                  Notifications: 'notifications',
                  Chat: 'chat/:conversationId?',
                  Wallet: 'wallet',
                  Referral: 'referral',
                  Help: 'help',
                  About: 'about',
                },
              },
            },
          },
          ProductDetail: 'product/:productId',
          Categories: 'categories/:categoryId?',
          Search: 'search',
          Cart: 'cart',
          Checkout: 'checkout',
          Orders: 'orders',
          OrderDetail: 'orders/:orderId',
          Profile: 'profile',
          Settings: 'settings',
          Wishlist: 'wishlist',
          Notifications: 'notifications',
          Chat: 'chat/:conversationId?',
          Wallet: 'wallet',
          Referral: 'referral',
          Help: 'help',
          About: 'about',
          SellerDashboard: 'seller/dashboard',
          AddProduct: 'seller/products/add/:productId?',
          ManageProducts: 'seller/products',
          SellerOrders: 'seller/orders',
          SellerAnalytics: 'seller/analytics',
          SellerProfile: 'seller/profile',
        },
      },
    },
  },
};

// Navigation Helpers
export const navigateToProduct = (navigation: any, productId: string, sellerId?: string) => {
  navigation.navigate('ProductDetail', { productId, sellerId });
};

export const navigateToCategory = (navigation: any, categoryId: string, categoryName?: string) => {
  navigation.navigate('Categories', { categoryId, categoryName });
};

export const navigateToSearch = (navigation: any, query?: string, showFilters = false) => {
  navigation.navigate('Search', { initialQuery: query, showFilters });
};

export const navigateToCart = (navigation: any) => {
  navigation.navigate('Cart');
};

export const navigateToCheckout = (navigation: any, fromCart = false, buyNowProduct?: string) => {
  navigation.navigate('Checkout', { fromCart, buyNowProduct });
};

export const navigateToOrderDetail = (navigation: any, orderId: string) => {
  navigation.navigate('OrderDetail', { orderId });
};

export const navigateToChat = (navigation: any, conversationId?: string) => {
  navigation.navigate('Chat', { conversationId });
};

export const navigateToSellerDashboard = (navigation: any) => {
  navigation.navigate('SellerDashboard');
};

// Tab Navigation Helpers
export const switchToTab = (navigation: any, tabName: keyof MainTabParamList) => {
  navigation.navigate('MainTabs', { screen: tabName });
};

export const goBack = (navigation: any) => {
  if (navigation.canGoBack()) {
    navigation.goBack();
  }
};

// Reset Navigation Helpers
export const resetToAuth = (navigation: any) => {
  navigation.reset({
    index: 0,
    routes: [{ name: 'Auth' }],
  });
};

export const resetToMain = (navigation: any) => {
  navigation.reset({
    index: 0,
    routes: [{ name: 'Main' }],
  });
};

export const resetToOnboarding = (navigation: any) => {
  navigation.reset({
    index: 0,
    routes: [{ name: 'Onboarding' }],
  });
};