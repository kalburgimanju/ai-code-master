import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { ThemeProvider as ReactNavigationThemeProvider } from '@react-navigation/native';
import { DefaultTheme, DarkTheme } from '@react-navigation/native';
import { MMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createMMKVStorage, persist } from 'zustand/middleware';

// MMKV Storage
export const storage = new MMKV({
  id: 'mobileapps-storage',
  encryptionKey: 'mobileapps-secure-key',
});

// Zustand store with MMKV persistence
interface AppState {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  onboardingComplete: boolean;
  setOnboardingComplete: (value: boolean) => void;
  language: string;
  setLanguage: (lang: string) => void;
  currency: string;
  setCurrency: (currency: string) => void;
  cartCount: number;
  setCartCount: (count: number) => void;
  incrementCartCount: () => void;
  decrementCartCount: () => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  role?: 'customer' | 'seller';
  addresses?: Address[];
}

interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isDarkMode: false,
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setTheme: (isDark: boolean) => set({ isDarkMode: isDark }),
      user: null,
      setUser: (user: User | null) => set({ user }),
      token: null,
      setToken: (token: string | null) => set({ token }),
      isAuthenticated: false,
      setIsAuthenticated: (value: boolean) => set({ isAuthenticated: value }),
      onboardingComplete: false,
      setOnboardingComplete: (value: boolean) => set({ onboardingComplete: value }),
      language: 'en',
      setLanguage: (lang: string) => set({ language: lang }),
      currency: 'USD',
      setCurrency: (currency: string) => set({ currency }),
      cartCount: 0,
      setCartCount: (count: number) => set({ cartCount: count }),
      incrementCartCount: () => set((state) => ({ cartCount: state.cartCount + 1 })),
      decrementCartCount: () => set((state) => ({ cartCount: Math.max(0, state.cartCount - 1) })),
    }),
    {
      name: 'app-storage',
      storage: createMMKVStorage(storage),
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        onboardingComplete: state.onboardingComplete,
        language: state.language,
        currency: state.currency,
        cartCount: state.cartCount,
      }),
    }
  )
);

// Theme Context
interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const AppThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const setTheme = useAppStore((state) => state.setTheme);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within an AppThemeProvider');
  }
  return context;
};

// Navigation Theme
const AppLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6366F1',
    background: '#FFFFFF',
    card: '#F8FAFC',
    text: '#1E293B',
    border: '#E2E8F0',
    notification: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    primaryLight: '#EEF2FF',
    primaryDark: '#4F46E5',
    backgroundSecondary: '#F1F5F9',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
  },
};

const AppDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#818CF8',
    background: '#0F172A',
    card: '#1E293B',
    text: '#F8FAFC',
    border: '#334155',
    notification: '#F87171',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    primaryLight: '#1E1B4B',
    primaryDark: '#6366F1',
    backgroundSecondary: '#1E293B',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
  },
};

export const useAppTheme = () => {
  const { isDarkMode } = useThemeContext();
  return isDarkMode ? AppDarkTheme : AppLightTheme;
};

// Providers Wrapper
interface ProvidersProps {
  children: ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  const isDarkMode = useAppStore((state) => state.isDarkMode);

  const navigationTheme = isDarkMode ? AppDarkTheme : AppLightTheme;

  return (
    <ReactNavigationThemeProvider theme={navigationTheme}>
      <AppThemeProvider>
        {children}
      </AppThemeProvider>
    </ReactNavigationThemeProvider>
  );
};

// App initialization
export const initializeApp = async () => {
  // Load fonts, initialize services, etc.
  try {
    // Load fonts
    // Initialize analytics, crash reporting, etc.
    // Check auth token validity
    const token = storage.getString('auth_token');
    if (token) {
      useAppStore.getState().setToken(token);
      useAppStore.getState().setIsAuthenticated(true);
    }

    const onboarding = storage.getBoolean('onboarding_complete');
    if (onboarding !== undefined) {
      useAppStore.getState().setOnboardingComplete(onboarding);
    }

    const theme = storage.getBoolean('dark_mode');
    if (theme !== undefined) {
      useAppStore.getState().setTheme(theme);
    }

    const language = storage.getString('language') || 'en';
    useAppStore.getState().setLanguage(language);

    const currency = storage.getString('currency') || 'USD';
    useAppStore.getState().setCurrency(currency);

    const cartCount = storage.getNumber('cart_count') || 0;
    useAppStore.getState().setCartCount(cartCount);
  } catch (error) {
    console.error('App initialization error:', error);
  }
};

export { storage, useAppStore };
export type { AppState, User, Address };