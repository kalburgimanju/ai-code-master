import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Banner } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface BannerCarouselProps {
  banners: Banner[];
  onPress?: (banner: Banner) => void;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showIndicators?: boolean;
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({
  banners,
  onPress,
  autoPlay = true,
  autoPlayInterval = 5000,
  showIndicators = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [layoutMeasured, setLayoutMeasured] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const itemWidth = SCREEN_WIDTH - 32;

  useEffect(() => {
    if (!autoPlay || banners.length <= 1) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % banners.length;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * itemWidth,
        animated: true,
      });
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [currentIndex, banners.length, autoPlay, autoPlayInterval]);

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / itemWidth);
    if (index !== currentIndex && index >= 0 && index < banners.length) {
      setCurrentIndex(index);
    }
  };

  const handleMomentumScrollEnd = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / itemWidth);
    if (index !== currentIndex && index >= 0 && index < banners.length) {
      setCurrentIndex(index);
    }
  };

  const handleLayout = () => {
    setLayoutMeasured(true);
  };

  if (banners.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onContentSizeChange={handleLayout}
        scrollEventThrottle={16}
        contentContainerStyle={styles.contentContainer}
        decelerationRate="fast"
      >
        {banners.map((banner, index) => (
          <TouchableOpacity
            key={banner.id}
            onPress={() => onPress?.(banner)}
            style={styles.bannerWrapper}
            activeOpacity={0.9}
          >
            <View style={styles.bannerContainer}>
              <Image
                source={{ uri: banner.image }}
                style={styles.bannerImage}
                resizeMode="cover"
              />
              {(banner.title || banner.subtitle) && (
                <View style={styles.textOverlay}>
                  {banner.title && (
                    <Text style={styles.bannerTitle}>{banner.title}</Text>
                  )}
                  {banner.subtitle && (
                    <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
                  )}
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {showIndicators && banners.length > 1 && layoutMeasured && (
        <View style={styles.indicatorsContainer}>
          {banners.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentIndex && styles.indicatorActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  contentContainer: {
    flexDirection: 'row',
  },
  bannerWrapper: {
    width: SCREEN_WIDTH - 32,
  },
  bannerContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 16,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  textOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
  indicatorsContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  indicatorActive: {
    width: 24,
    backgroundColor: '#FFFFFF',
  },
});