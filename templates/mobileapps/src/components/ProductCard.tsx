import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../providers/Providers';
import { ProductSummary as Product } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  style?: any;
  showBadge?: string;
  showQuickAdd?: boolean;
  onQuickAdd?: () => void;
  variant?: 'horizontal' | 'grid' | 'list' | 'flash';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  style,
  showBadge,
  showQuickAdd = false,
  onQuickAdd,
  variant = 'horizontal',
}) => {
  const theme = useAppTheme();
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount && product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const getCardWidth = () => {
    switch (variant) {
      case 'flash':
        return 160;
      case 'grid':
        return (SCREEN_WIDTH - 40) / 2;
      case 'list':
        return SCREEN_WIDTH - 32;
      case 'horizontal':
      default:
        return 170;
    }
  };

  const cardWidth = getCardWidth();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.card,
        style,
        { backgroundColor: theme.colors.card, width: cardWidth },
        variant === 'list' && styles.listCard,
      ]}
      activeOpacity={0.8}
    >
      {variant === 'list' ? (
        <View style={styles.listContent}>
          <View style={styles.listImageContainer}>
            <Image
              source={{ uri: product.image }}
              style={styles.listImage}
              resizeMode="cover"
            />
            {hasDiscount && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{discountPercent}%</Text>
              </View>
            )}
            {showBadge && (
              <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.badgeText}>{showBadge}</Text>
              </View>
            )}
          </View>

          <View style={styles.listDetails}>
            <View style={styles.sellerRow}>
              <Text style={[styles.sellerName, { color: theme.colors.textSecondary }]}>
                {product.seller?.name}
              </Text>
              {product.seller?.rating && (
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text style={styles.ratingText}>{product.seller.rating.toFixed(1)}</Text>
                </View>
              )}
            </View>

            <Text
              style={[styles.productName, { color: theme.colors.text }]}
              numberOfLines={2}
            >
              {product.name}
            </Text>

            <View style={styles.priceRow}>
              <Text style={[styles.currentPrice, { color: theme.colors.text }]}>
                ${product.price.toLocaleString()}
              </Text>
              {hasDiscount && product.originalPrice && (
                <Text style={[styles.originalPrice, { color: theme.colors.textMuted }]}>
                  ${product.originalPrice.toLocaleString()}
                </Text>
              )}
            </View>

            <View style={styles.ratingRow}>
              <View style={styles.stars}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Ionicons
                    key={i}
                    name={i < Math.floor(product.rating) ? 'star' : 'star-outline'}
                    size={12}
                    color="#F59E0B"
                  />
                ))}
              </View>
              <Text style={[styles.reviewCount, { color: theme.colors.textMuted }]}>
                ({product.reviewCount.toLocaleString()})
              </Text>
              {product.isFlashSale && (
                <View style={styles.flashSaleBadge}>
                  <Ionicons name="flash" size={10} color="#EF4444" />
                  <Text style={styles.flashSaleText}>Flash Sale</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: product.image }}
              style={styles.image}
              resizeMode="cover"
            />
            {hasDiscount && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{discountPercent}%</Text>
              </View>
            )}
            {showBadge && (
              <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.badgeText}>{showBadge}</Text>
              </View>
            )}
            {!product.inStock && (
              <View style={styles.outOfStockOverlay}>
                <Text style={styles.outOfStockText}>Out of Stock</Text>
              </View>
            )}
            {showQuickAdd && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onQuickAdd?.();
                }}
                style={styles.quickAddButton}
                activeOpacity={0.9}
              >
                <MaterialIcons name="add-shopping-cart" size={24} color={theme.colors.background} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.content}>
            <View style={styles.sellerRow}>
              <Text style={[styles.sellerName, { color: theme.colors.textSecondary }]}>
                {product.seller?.name}
              </Text>
              {product.seller?.rating && (
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text style={styles.ratingText}>{product.seller.rating.toFixed(1)}</Text>
                </View>
              )}
            </View>

            <Text
              style={[styles.productName, { color: theme.colors.text }]}
              numberOfLines={2}
            >
              {product.name}
            </Text>

            <View style={styles.priceRow}>
              <Text style={[styles.currentPrice, { color: theme.colors.text }]}>
                ${product.price.toLocaleString()}
              </Text>
              {hasDiscount && product.originalPrice && (
                <Text style={[styles.originalPrice, { color: theme.colors.textMuted }]}>
                  ${product.originalPrice.toLocaleString()}
                </Text>
              )}
            </View>

            <View style={styles.ratingRow}>
              <View style={styles.stars}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Ionicons
                    key={i}
                    name={i < Math.floor(product.rating) ? 'star' : 'star-outline'}
                    size={12}
                    color="#F59E0B"
                  />
                ))}
              </View>
              <Text style={[styles.reviewCount, { color: theme.colors.textMuted }]}>
                ({product.reviewCount.toLocaleString()})
              </Text>
              {product.isFlashSale && (
                <View style={styles.flashSaleBadge}>
                  <Ionicons name="flash" size={10} color="#EF4444" />
                  <Text style={styles.flashSaleText}>Flash Sale</Text>
                </View>
              )}
            </View>
          </View>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  listCard: {
    flexDirection: 'row',
    height: 120,
  },
  listContent: {
    flex: 1,
    flexDirection: 'row',
  },
  listImageContainer: {
    width: 100,
    position: 'relative',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    overflow: 'hidden',
  },
  listImage: {
    width: '100%',
    height: '100%',
  },
  listDetails: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 1,
    backgroundColor: '#F1F5F9',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EF4444',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  quickAddButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: 10,
  },
  sellerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sellerName: {
    fontSize: 11,
    fontWeight: '500',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F59E0B',
  },
  productName: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 6,
  },
  currentPrice: {
    fontSize: 15,
    fontWeight: '700',
  },
  originalPrice: {
    fontSize: 12,
    fontWeight: '500',
    textDecorationLine: 'line-through',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stars: {
    flexDirection: 'row',
  },
  reviewCount: {
    fontSize: 11,
    fontWeight: '500',
  },
  flashSaleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#FEF2F2',
    borderRadius: 4,
    marginLeft: 'auto',
  },
  flashSaleText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#EF4444',
    textTransform: 'uppercase',
  },
});