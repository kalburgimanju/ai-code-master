import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons, MaterialIcons, MaterialCommunityIcons, Feather, AntDesign } from '@expo/vector-icons';
import { useAppTheme, useAppStore } from '../providers/Providers';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { Product, ProductVariant, Seller, Review } from '../types';
import { ProductCard } from '../components/ProductCard';
import { SectionHeader } from '../components/SectionHeader';
import { QuantitySelector } from '../components/QuantitySelector';
import { RatingStars } from '../components/RatingStars';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ProductDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProductDetail'>;
type ProductDetailScreenRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

export const ProductDetailScreen = () => {
  const navigation = useNavigation<ProductDetailScreenNavigationProp>();
  const route = useRoute<ProductDetailScreenRouteProp>();
  const theme = useAppTheme();
  const { cartCount, incrementCartCount } = useAppStore();
  const productId = route.params?.productId;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [showSellerModal, setShowSellerModal] = useState(false);

  // Mock data - in real app would fetch from API
  const fetchProduct = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockProduct: Product = {
        id: productId || '1',
        name: 'iPhone 15 Pro Max 256GB Natural Titanium',
        price: 1199,
        originalPrice: 1299,
        discount: 8,
        rating: 4.8,
        reviewCount: 2341,
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800',
        images: [
          'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800',
          'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800',
          'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800',
        ],
        category: 'Electronics',
        subcategory: 'Smartphones',
        description: 'The iPhone 15 Pro Max features a 6.7-inch Super Retina XDR display with ProMotion technology, A17 Pro chip with 6-core GPU, and a triple camera system with 48MP main camera. Built with aerospace-grade titanium and Ceramic Shield front cover.',
        shortDescription: 'Latest iPhone with A17 Pro chip, titanium design, and advanced camera system.',
        isFlashSale: true,
        flashSaleEndTime: Date.now() + 86400000,
        inStock: true,
        stockCount: 45,
        sku: 'IP15PM-256-NT',
        brand: 'Apple',
        tags: ['smartphone', 'apple', '5g', 'flagship', 'photography'],
        specifications: {
          Display: '6.7" Super Retina XDR with ProMotion',
          Chip: 'A17 Pro with 6-core GPU',
          Camera: '48MP Main + 12MP Ultra Wide + 12MP Telephoto',
          Storage: '256GB',
          Battery: 'Up to 29 hours video playback',
          OS: 'iOS 17',
          Connectivity: '5G, Wi-Fi 6E, Bluetooth 5.3',
          Build: 'Titanium frame, Ceramic Shield front',
          WaterResistance: 'IP68 (6m for 30 min)',
        },
        variants: [
          { id: 'v1', name: 'Storage', value: '128GB', price: 1099, inStock: true },
          { id: 'v2', name: 'Storage', value: '256GB', price: 1199, inStock: true },
          { id: 'v3', name: 'Storage', value: '512GB', price: 1399, inStock: true },
          { id: 'v4', name: 'Storage', value: '1TB', price: 1599, inStock: false },
          { id: 'v5', name: 'Color', value: 'Natural Titanium', price: 0, inStock: true, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800' },
          { id: 'v6', name: 'Color', value: 'Blue Titanium', price: 0, inStock: true },
          { id: 'v7', name: 'Color', value: 'White Titanium', price: 0, inStock: true },
          { id: 'v8', name: 'Color', value: 'Black Titanium', price: 0, inStock: true },
        ],
        seller: {
          id: '1',
          name: 'Apple Official Store',
          rating: 4.9,
          reviewCount: 12450,
          avatar: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100',
          verified: true,
          responseTime: 'Within 1 hour',
          joinedAt: '2020-01-15',
          location: 'Cupertino, CA',
        },
        shippingInfo: {
          freeShipping: true,
          estimatedDays: 2,
          expressAvailable: true,
          expressCost: 9.99,
          expressDays: 1,
        },
        returnPolicy: {
          days: 30,
          freeReturns: true,
          conditions: 'Items must be in original condition with all accessories.',
        },
        warranty: {
          period: 1,
          periodUnit: 'years',
          type: 'manufacturer',
          description: 'Apple Limited Warranty covers manufacturing defects for 1 year.',
        },
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-20T10:00:00Z',
      };
      setProduct(mockProduct);
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  React.useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleAddToCart = () => {
    if (!product || !product.inStock) return;
    incrementCartCount();
    // In real app: addToCart(product, selectedVariant, quantity);
    alert(`${quantity} x ${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    if (!product || !product.inStock) return;
    navigation.navigate('Checkout', { buyNowProduct: product.id });
  };

  const handleShare = () => {
    // Share product
    console.log('Share product:', product?.name);
  };

  const handleWishlist = () => {
    // Toggle wishlist
    console.log('Toggle wishlist:', product?.id);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.colors.textMuted} />
          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>Product not found</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.8}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount && product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Gallery */}
        <View style={styles.imageGalleryContainer}>
          <Image
            source={{ uri: product.images?.[selectedImageIndex] || product.image }}
            style={styles.mainImage}
            resizeMode="cover"
          />

          {product.isFlashSale && product.flashSaleEndTime && (
            <View style={styles.flashSaleBadge}>
              <Ionicons name="flash" size={14} color="#FFFFFF" />
              <Text style={styles.flashSaleBadgeText}>Flash Sale Ends Soon</Text>
            </View>
          )}

          {/* Thumbnails */}
          {(product.images && product.images.length > 1) && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailsContainer}
            >
              {product.images.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImageIndex(index)}
                  style={[
                    styles.thumbnail,
                    index === selectedImageIndex && styles.thumbnailActive,
                  ]}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: img }} style={styles.thumbnailImage} resizeMode="cover" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Action Buttons */}
          <View style={styles.imageActions}>
            <TouchableOpacity
              onPress={() => setShowImageModal(true)}
              style={styles.imageActionButton}
              activeOpacity={0.8}
            >
              <Ionicons name="expand-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleShare}
              style={styles.imageActionButton}
              activeOpacity={0.8}
            >
              <Ionicons name="share-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleWishlist}
              style={styles.imageActionButton}
              activeOpacity={0.8}
            >
              <Ionicons name="heart-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          {/* Category & Brand */}
          <View style={styles.categoryRow}>
            <Text style={[styles.categoryText, { color: theme.colors.textSecondary }]}>
              {product.category} > {product.subcategory}
            </Text>
            <Text style={[styles.brandText, { color: theme.colors.primary }]}>
              {product.brand}
            </Text>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: theme.colors.text }]}>{product.name}</Text>

          {/* Rating & Reviews */}
          <View style={styles.ratingRow}>
            <RatingStars rating={product.rating} size={18} showCount={true} count={product.reviewCount} />
            <TouchableOpacity
              onPress={() => setShowReviewsModal(true)}
              style={styles.reviewsLink}
              activeOpacity={0.8}
            >
              <Text style={[styles.reviewsText, { color: theme.colors.textSecondary }]}>
                {product.reviewCount.toLocaleString()} reviews
              </Text>
            </TouchableOpacity>
            <View style={styles.soldCount}>
              <Ionicons name="cart-outline" size={14} color={theme.colors.textMuted} />
              <Text style={[styles.soldText, { color: theme.colors.textMuted }]}>1.2k+ sold</Text>
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={[styles.currentPrice, { color: theme.colors.text }]}>
              ${product.price.toLocaleString()}
            </Text>
            {hasDiscount && product.originalPrice && (
              <>
                <Text style={[styles.originalPrice, { color: theme.colors.textMuted }]}>
                  ${product.originalPrice.toLocaleString()}
                </Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountBadgeText}>Save {discountPercent}%</Text>
                </View>
              </>
            )}
          </View>

          {/* Flash Sale Timer */}
          {product.isFlashSale && product.flashSaleEndTime && (
            <FlashSaleTimer endTime={product.flashSaleEndTime} />
          )}

          {/* Stock Status */}
          <View style={styles.stockRow}>
            <View style={[
              styles.stockBadge,
              product.inStock ? styles.stockIn : styles.stockOut,
            ]}>
              <View style={[
                styles.stockDot,
                product.inStock ? styles.stockDotIn : styles.stockDotOut,
              ]} />
              <Text style={styles.stockText}>
                {product.inStock ? `In Stock (${product.stockCount || 'Many'} left)` : 'Out of Stock'}
              </Text>
            </View>
            {product.sku && (
              <Text style={[styles.skuText, { color: theme.colors.textMuted }]}>
                SKU: {product.sku}
              </Text>
            )}
          </View>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <View style={styles.variantsSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Select Options</Text>
              {Object.entries(
                product.variants.reduce((acc, v) => {
                  if (!acc[v.name]) acc[v.name] = [];
                  acc[v.name].push(v);
                  return acc;
                }, {} as Record<string, ProductVariant[]>)
              ).map(([name, variants]) => (
                <View key={name} style={styles.variantGroup}>
                  <Text style={[styles.variantLabel, { color: theme.colors.text }]}>{name}</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.variantsContainer}
                  >
                    {variants.map((variant) => (
                      <TouchableOpacity
                        key={variant.id}
                        onPress={() => variant.inStock && setSelectedVariant(variant)}
                        style={[
                          styles.variantButton,
                          selectedVariant?.id === variant.id && styles.variantButtonSelected,
                          !variant.inStock && styles.variantButtonDisabled,
                        ]}
                        activeOpacity={0.8}
                        disabled={!variant.inStock}
                      >
                        {variant.image ? (
                          <Image source={{ uri: variant.image }} style={styles.variantImage} />
                        ) : (
                          <Text style={[
                            styles.variantButtonText,
                            selectedVariant?.id === variant.id ? styles.variantButtonTextSelected : {},
                            !variant.inStock && styles.variantButtonTextDisabled,
                          ]}>
                            {variant.value}
                          </Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              ))}
            </View>
          )}

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quantity</Text>
            <QuantitySelector
              value={quantity}
              onChange={setQuantity}
              max={product.stockCount || 99}
              min={1}
            />
          </View>

          {/* Shipping & Returns */}
          <View style={styles.infoCards}>
            {product.shippingInfo && (
              <View style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
                <View style={styles.infoCardIcon}>
                  <Ionicons name="truck-outline" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.infoCardContent}>
                  <Text style={[styles.infoCardTitle, { color: theme.colors.text }]}>Fast Shipping</Text>
                  <Text style={[styles.infoCardText, { color: theme.colors.textSecondary }]}>
                    {product.shippingInfo.freeShipping ? 'Free' : `$${product.shippingInfo.cost}`}
                    delivery in {product.shippingInfo.estimatedDays} days
                  </Text>
                </View>
              </View>
            )}
            {product.returnPolicy && (
              <View style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
                <View style={styles.infoCardIcon}>
                  <Ionicons name="refresh-outline" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.infoCardContent}>
                  <Text style={[styles.infoCardTitle, { color: theme.colors.text }]}>Easy Returns</Text>
                  <Text style={[styles.infoCardText, { color: theme.colors.textSecondary }]}>
                    {product.returnPolicy.days} days {product.returnPolicy.freeReturns ? 'free' : ''} returns
                  </Text>
                </View>
              </View>
            )}
            {product.warranty && (
              <View style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
                <View style={styles.infoCardIcon}>
                  <Ionicons name="shield-checkmark-outline" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.infoCardContent}>
                  <Text style={[styles.infoCardTitle, { color: theme.colors.text }]}>Warranty</Text>
                  <Text style={[styles.infoCardText, { color: theme.colors.textSecondary }]}>
                    {product.warranty.period} {product.warranty.periodUnit} {product.warranty.type}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Seller Info */}
          <TouchableOpacity onPress={() => setShowSellerModal(true)} style={styles.sellerCard} activeOpacity={0.8}>
            <View style={styles.sellerAvatar}>
              {product.seller.avatar ? (
                <Image source={{ uri: product.seller.avatar }} style={styles.sellerAvatarImage} />
              ) : (
                <Ionicons name="storefront-outline" size={28} color={theme.colors.primary} />
              )}
              {product.seller.verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                </View>
              )}
            </View>
            <View style={styles.sellerInfo}>
              <Text style={[styles.sellerName, { color: theme.colors.text }]}>{product.seller.name}</Text>
              <View style={styles.sellerMeta}>
                <RatingStars rating={product.seller.rating} size={12} showCount={false} />
                <Text style={[styles.sellerMetaText, { color: theme.colors.textSecondary }]}>
                  {product.seller.reviewCount.toLocaleString()} reviews · {product.seller.responseTime}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Description</Text>
            <Text style={[styles.descriptionText, { color: theme.colors.textSecondary }]}>
              {product.description}
            </Text>
          </View>

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <View style={styles.specsSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Specifications</Text>
              <View style={styles.specsList}>
                {Object.entries(product.specifications).map(([key, value]) => (
                  <View key={key} style={styles.specRow}>
                    <Text style={[styles.specKey, { color: theme.colors.textSecondary }]}>{key}</Text>
                    <Text style={[styles.specValue, { color: theme.colors.text }]}>{value}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Tags</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsContainer}>
                {product.tags.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Bottom Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            onPress={handleAddToCart}
            disabled={!product.inStock}
            style={[
              styles.addToCartButton,
              !product.inStock && styles.buttonDisabled,
            ]}
            activeOpacity={0.9}
          >
            <Ionicons name="cart-outline" size={22} color="#FFFFFF" />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleBuyNow}
            disabled={!product.inStock}
            style={[
              styles.buyNowButton,
              !product.inStock && styles.buttonDisabled,
            ]}
            activeOpacity={0.9}
          >
            <Text style={styles.buyNowText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Image Modal */}
      <Modal visible={showImageModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.imageModal}>
            <TouchableOpacity onPress={() => setShowImageModal(false)} style={styles.modalClose}>
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.modalImageContainer}
            >
              {(product.images || [product.image]).map((img, index) => (
                <Image key={index} source={{ uri: img }} style={styles.modalImage} resizeMode="contain" />
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Reviews Modal */}
      <Modal visible={showReviewsModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.reviewsModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Reviews ({product.reviewCount.toLocaleString()})</Text>
            <TouchableOpacity onPress={() => setShowReviewsModal(false)} style={styles.modalClose}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.reviewsList}>
            {[
              { user: 'John D.', rating: 5, date: '2 days ago', text: 'Amazing phone! Camera quality is outstanding.', verified: true },
              { user: 'Sarah M.', rating: 4, date: '1 week ago', text: 'Great device but battery could be better.', verified: true },
              { user: 'Mike R.', rating: 5, date: '2 weeks ago', text: 'Best iPhone ever. Fast, beautiful screen.', verified: true },
            ].map((review, index) => (
              <View key={index} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewUser}>{review.user}</Text>
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
                <RatingStars rating={review.rating} size={16} />
                {review.verified && <Text style={styles.verifiedPurchase}>Verified Purchase</Text>}
                <Text style={styles.reviewText}>{review.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </Modal>

      {/* Seller Modal */}
      <Modal visible={showSellerModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.sellerModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seller Information</Text>
            <TouchableOpacity onPress={() => setShowSellerModal(false)} style={styles.modalClose}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.sellerModalContent}>
            <View style={styles.sellerDetailCard}>
              {product.seller.avatar ? (
                <Image source={{ uri: product.seller.avatar }} style={styles.sellerDetailAvatar} />
              ) : (
                <View style={[styles.sellerDetailAvatarPlaceholder, { backgroundColor: theme.colors.primaryLight }]}>
                  <Ionicons name="storefront-outline" size={40} color={theme.colors.primary} />
                </View>
              )}
              <View style={styles.sellerDetailInfo}>
                <View style={styles.sellerDetailNameRow}>
                  <Text style={styles.sellerDetailName}>{product.seller.name}</Text>
                  {product.seller.verified && (
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                  )}
                </View>
                <RatingStars rating={product.seller.rating} size={18} showCount={true} count={product.seller.reviewCount} />
                <Text style={styles.sellerDetailMeta}>Joined {new Date(product.seller.joinedAt).getFullYear()}</Text>
                <Text style={styles.sellerDetailMeta}>{product.seller.location}</Text>
                <Text style={styles.sellerDetailMeta}>Typically responds: {product.seller.responseTime}</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Flash Sale Timer Component
const FlashSaleTimer: React.FC<{ endTime: number }> = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, endTime - Date.now()));
  const theme = useAppTheme();

  React.useEffect(() => {
    const interval = setInterval(() => {
      const left = Math.max(0, endTime - Date.now());
      setTimeLeft(left);
      if (left === 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  if (timeLeft <= 0) return null;

  return (
    <View style={styles.flashSaleTimer}>
      <Text style={styles.flashSaleTimerLabel}>Flash Sale Ends In</Text>
      <View style={styles.timerDigits}>
        <View style={styles.timerUnit}>
          <Text style={styles.timerValue}>{hours.toString().padStart(2, '0')}</Text>
          <Text style={styles.timerLabel}>HRS</Text>
        </View>
        <Text style={styles.timerSeparator}>:</Text>
        <View style={styles.timerUnit}>
          <Text style={styles.timerValue}>{minutes.toString().padStart(2, '0')}</Text>
          <Text style={styles.timerLabel}>MIN</Text>
        </View>
        <Text style={styles.timerSeparator}>:</Text>
        <View style={styles.timerUnit}>
          <Text style={styles.timerValue}>{seconds.toString().padStart(2, '0')}</Text>
          <Text style={styles.timerLabel}>SEC</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#6366F1',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageGalleryContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F1F5F9',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  flashSaleBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  flashSaleBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  thumbnailsContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    flexDirection: 'row',
    gap: 8,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: '#6366F1',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  imageActions: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  imageActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    padding: 20,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
  },
  brandText: {
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 30,
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  reviewsLink: {
    paddingVertical: 2,
  },
  reviewsText: {
    fontSize: 13,
    fontWeight: '500',
  },
  soldCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  soldText: {
    fontSize: 13,
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  currentPrice: {
    fontSize: 28,
    fontWeight: '800',
  },
  originalPrice: {
    fontSize: 18,
    fontWeight: '500',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountBadgeText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  flashSaleTimer: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  flashSaleTimerLabel: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  timerDigits: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  timerUnit: {
    alignItems: 'center',
  },
  timerValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#EF4444',
    fontFamily: 'monospace',
  },
  timerLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#EF4444',
    textTransform: 'uppercase',
  },
  timerSeparator: {
    fontSize: 24,
    fontWeight: '800',
    color: '#EF4444',
  },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  stockIn: {
    backgroundColor: '#ECFDF5',
  },
  stockOut: {
    backgroundColor: '#FEF2F2',
  },
  stockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stockDotIn: {
    backgroundColor: '#10B981',
  },
  stockDotOut: {
    backgroundColor: '#EF4444',
  },
  stockText: {
    fontSize: 13,
    fontWeight: '600',
  },
  skuText: {
    fontSize: 13,
    fontWeight: '500',
  },
  variantsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  variantGroup: {
    marginBottom: 16,
  },
  variantLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  variantsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  variantButton: {
    minWidth: 56,
    height: 40,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  variantButtonSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  variantButtonDisabled: {
    opacity: 0.4,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  variantButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  variantButtonTextSelected: {
    color: '#6366F1',
  },
  variantButtonTextDisabled: {
    color: '#94A3B8',
  },
  variantImage: {
    width: 32,
    height: 32,
    borderRadius: 6,
  },
  quantitySection: {
    marginBottom: 20,
  },
  infoCards: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  infoCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  infoCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  infoCardText: {
    fontSize: 11,
    fontWeight: '500',
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    marginBottom: 20,
    gap: 12,
  },
  sellerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    position: 'relative',
  },
  sellerAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  sellerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sellerMetaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  specsSection: {
    marginBottom: 24,
  },
  specsList: {
    gap: 12,
  },
  specRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  specKey: {
    width: 120,
    fontSize: 14,
    fontWeight: '500',
  },
  specValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  tagsSection: {
    marginBottom: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    gap: 12,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  addToCartText: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '700',
  },
  buyNowButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    alignItems: 'center',
  },
  buyNowText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModal: {
    width: '100%',
    height: '100%',
  },
  modalClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImageContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalImage: {
    width: '100%',
    height: '80%',
  },
  reviewsModal: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  sellerModal: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  reviewsList: {
    flex: 1,
    padding: 20,
  },
  reviewItem: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  reviewUser: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  verifiedPurchase: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
    marginTop: 4,
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#475569',
    marginTop: 8,
  },
  sellerModalContent: {
    padding: 20,
  },
  sellerDetailCard: {
    flexDirection: 'row',
    gap: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  sellerDetailAvatar: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  sellerDetailAvatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellerDetailInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  sellerDetailNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sellerDetailName: {
    fontSize: 18,
    fontWeight: '700',
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },
  sellerDetailMeta: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
});