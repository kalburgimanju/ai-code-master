import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useAppTheme, useAppStore, initializeApp } from '../providers/Providers';
import { Ionicons, MaterialIcons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Platform, StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Screen imports (will create these next)
import { HomeScreen } from '../screens/HomeScreen';
import { ProductsScreen } from '../screens/ProductsScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { CartScreen } from '../screens/CartScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { OrderDetailScreen } from '../screens/OrderDetailScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { WishlistScreen } from '../screens/WishlistScreen';
import { CategoriesScreen } from '../screens/CategoriesScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { WalletScreen } from '../screens/WalletScreen';
import { ReferralScreen } from '../screens/ReferralScreen';
import { HelpScreen } from '../screens/HelpScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { VerifyOTPScreen } from '../screens/auth/VerifyOTPScreen';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { SellerDashboardScreen } from '../screens/seller/SellerDashboardScreen';
import { AddProductScreen } from '../screens/seller/AddProductScreen';
import { ManageProductsScreen } from '../screens/seller/ManageProductsScreen';
import { SellerOrdersScreen } from '../screens/seller/SellerOrdersScreen';
import { SellerAnalyticsScreen } from '../screens/seller/SellerAnalyticsScreen';
import { SellerProfileScreen } from '../screens/seller/SellerProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Auth Stack
const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
    </Stack.Navigator>
  );
};

// Main App Stack (after auth)
const MainStack = () => {
  const { isAuthenticated, user } = useAppStore();
  const isSeller = user?.role === 'seller';

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: 'transparent', elevation: 0 },
        headerTitleAlign: 'center',
        headerTintColor: '#1E293B',
      }}
    >
      {/* Main Tab Navigator */}
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />

      {/* Product Screens */}
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Product Details' }}
      />
      <Stack.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{ title: 'Categories' }}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{ title: 'Search' }}
      />

      {/* Cart & Checkout */}
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{ title: 'Shopping Cart' }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ title: 'Checkout' }}
      />

      {/* Orders */}
      <Stack.Screen
        name="Orders"
        component={OrdersScreen}
        options={{ title: 'My Orders' }}
      />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ title: 'Order Details' }}
      />

      {/* Profile & Settings */}
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{ title: 'Wishlist' }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ title: 'Messages' }}
      />
      <Stack.Screen
        name="Wallet"
        component={WalletScreen}
        options={{ title: 'Wallet' }}
      />
      <Stack.Screen
        name="Referral"
        component={ReferralScreen}
        options={{ title: 'Refer & Earn' }}
      />
      <Stack.Screen
        name="Help"
        component={HelpScreen}
        options={{ title: 'Help & Support' }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{ title: 'About' }}
      />

      {/* Seller Screens (conditional) */}
      {isSeller && (
        <>
          <Stack.Screen
            name="SellerDashboard"
            component={SellerDashboardScreen}
            options={{ title: 'Seller Dashboard' }}
          />
          <Stack.Screen
            name="AddProduct"
            component={AddProductScreen}
            options={{ title: 'Add Product' }}
          />
          <Stack.Screen
            name="ManageProducts"
            component={ManageProductsScreen}
            options={{ title: 'Manage Products' }}
          />
          <Stack.Screen
            name="SellerOrders"
            component={SellerOrdersScreen}
            options={{ title: 'Seller Orders' }}
          />
          <Stack.Screen
            name="SellerAnalytics"
            component={SellerAnalyticsScreen}
            options={{ title: 'Analytics' }}
          />
          <Stack.Screen
            name="SellerProfile"
            component={SellerProfileScreen}
            options={{ title: 'Seller Profile' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

// Main Bottom Tabs
const MainTabs = () => {
  const theme = useAppTheme();
  const { isDarkMode } = useAppStore();

  const tabBarActiveColor = theme.colors.primary;
  const tabBarInactiveColor = theme.colors.textMuted;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;
          let IconComponent: React.ComponentType<any> = Ionicons;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Products':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'Cart':
              iconName = focused ? 'cart' : 'cart-outline';
              break;
            case 'Orders':
              iconName = focused ? 'bag-handle' : 'bag-handle-outline';
              IconComponent = MaterialCommunityIcons;
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-circle';
          }

          return <IconComponent name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: tabBarActiveColor,
        tabBarInactiveTintColor: tabBarInactiveColor,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: theme.colors.border,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          height: Platform.OS === 'ios' ? 90 : 70,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Products" component={ProductsStack} />
      <Tab.Screen name="Cart" component={CartStack} />
      <Tab.Screen name="Orders" component={OrdersStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

// Nested Stacks for each tab (to maintain navigation state)
const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Search' }} />
    <Stack.Screen name="Categories" component={CategoriesScreen} options={{ title: 'Categories' }} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product' }} />
  </Stack.Navigator>
);

const ProductsStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Products" component={ProductsScreen} options={{ title: 'Products' }} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product' }} />
    <Stack.Screen name="Categories" component={CategoriesScreen} options={{ title: 'Categories' }} />
    <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Search' }} />
  </Stack.Navigator>
);

const CartStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Cart' }} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
  </Stack.Navigator>
);

const OrdersStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: 'Orders' }} />
    <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order Details' }} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    <Stack.Screen name="Wishlist" component={WishlistScreen} options={{ title: 'Wishlist' }} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
    <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Messages' }} />
    <Stack.Screen name="Wallet" component={WalletScreen} options={{ title: 'Wallet' }} />
    <Stack.Screen name="Referral" component={ReferralScreen} options={{ title: 'Refer & Earn' }} />
    <Stack.Screen name="Help" component={HelpScreen} options={{ title: 'Help' }} />
    <Stack.Screen name="About" component={AboutScreen} options={{ title: 'About' }} />
  </Stack.Navigator>
);

// Main App Navigator
export const AppNavigator = () => {
  const { isAuthenticated, onboardingComplete } = useAppStore();
  const theme = useAppTheme();
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    const init = async () => {
      await initializeApp();
      setIsReady(true);
    };
    init();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!onboardingComplete ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : !isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : (
          <Stack.Screen name="Main" component={MainStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
});

export default AppNavigator;