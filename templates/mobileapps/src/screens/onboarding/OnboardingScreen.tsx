import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme, useAppStore } from '../../providers/Providers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const slides = [
  {
    icon: 'bag-handle-outline' as const,
    title: 'Shop Millions of Products',
    subtitle: 'Discover a wide range of products from top brands and sellers around the world.',
    color: '#6366F1',
  },
  {
    icon: 'shield-checkmark-outline' as const,
    title: 'Secure Payments',
    subtitle: 'Pay with confidence using our secure payment gateway with buyer protection.',
    color: '#10B981',
  },
  {
    icon: 'rocket-outline' as const,
    title: 'Fast Delivery',
    subtitle: 'Get your orders delivered quickly with real-time tracking and updates.',
    color: '#F59E0B',
  },
];

export const OnboardingScreen = () => {
  const theme = useAppTheme();
  const { setOnboardingComplete } = useAppStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({ x: nextIndex * SCREEN_WIDTH, animated: true });
    } else {
      setOnboardingComplete(true);
    }
  };

  const handleSkip = () => {
    setOnboardingComplete(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Skip Button */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleSkip} activeOpacity={0.8}>
          <Text style={[styles.skipText, { color: theme.colors.textSecondary }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setCurrentIndex(index);
        }}
      >
        {slides.map((slide, index) => (
          <View key={index} style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <View style={[styles.iconCircle, { backgroundColor: slide.color + '15' }]}>
              <Ionicons name={slide.icon} size={64} color={slide.color} />
            </View>
            <Text style={[styles.slideTitle, { color: theme.colors.text }]}>{slide.title}</Text>
            <Text style={[styles.slideSubtitle, { color: theme.colors.textSecondary }]}>{slide.subtitle}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Indicators & Button */}
      <View style={styles.bottomContainer}>
        <View style={styles.indicators}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentIndex && styles.indicatorActive,
                { backgroundColor: index === currentIndex ? theme.colors.primary : theme.colors.border },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={handleNext}
          style={[styles.nextButton, { backgroundColor: theme.colors.primary }]}
          activeOpacity={0.9}
        >
          <Text style={styles.nextButtonText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20, paddingTop: 12 },
  skipText: { fontSize: 16, fontWeight: '600' },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  iconCircle: { width: 140, height: 140, borderRadius: 70, justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  slideTitle: { fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  slideSubtitle: { fontSize: 16, fontWeight: '500', textAlign: 'center', lineHeight: 24, paddingHorizontal: 16 },
  bottomContainer: { paddingHorizontal: 24, paddingBottom: 40 },
  indicators: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 32 },
  indicator: { width: 8, height: 8, borderRadius: 4 },
  indicatorActive: { width: 24 },
  nextButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 12 },
  nextButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
