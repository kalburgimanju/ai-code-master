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
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons, MaterialIcons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useAppTheme, useAppStore } from '../providers/Providers';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Product, CartItem } from '../types';
import { ProductCard } from '../components/ProductCard';
import { QuantitySelector } from '../components/QuantitySelector';
import { SectionHeader } from '../components/SectionHeader';

type CartScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Cart'>;

export const CartScreen = () => {
  const navigation = useNavigation<CartScreenNavigationProp>();
  const theme = useAppTheme();
  const { cartCount, setCartCount, decrementCartCount } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock cart data
      const mockItems: CartItem[] = [
        {
          id: 'ci1',
          productId: '1',
          product: {
            id: '1',
            name: 'iPhone 15 Pro Max 256GB Natural Titanium',
            price: 1199,
            originalPrice: 1299,
            discount: 8,
            rating: 4.8,
            reviewCount: 2341,
            image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400',
            category: 'Electronics',
            isFlashSale: true,
            flashSaleEndTime: Date.now() + 86400000,
            inStock: true,
            seller: { id: '1', name: 'Apple Store', rating: 4.9 },
          },
          quantity: 1,
          addedAt: new Date().toISOString(),
        },
        {
          id: 'ci2',
          productId: '3',
          product: {
            id: '3',
            name: 'Sony WH-1000XM5 Wireless Headphones',
            price: 349,
            originalPrice: 399,
            discount: 13,
            rating: 4.7,
            reviewCount: 3421,
            image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400',
            category: 'Electronics',
            isFlashSale: false,
            inStock: true,
            seller: { id: '2', name: 'Sony Official', rating: 4.8 },
          },
          quantity: 2,
          addedAt: new Date().toISOString(),
        },
        {
          id: 'ci3',
          productId: '4',
          product: {
            id: '4',
            name: 'Nike Air Max 270',
            price: 129,
            originalPrice: 150,
            discount: 14,
            rating: 4.6,
            reviewCount: 5672,
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
            category: 'Fashion',
            isFlashSale: false,
            inStock: true,
            seller: { id: '3', name: 'Nike Store', rating: 4.7 },
          },
          quantity: 1,
          addedAt: new Date().toISOString(),
        },
      ];
      setCartItems(mockItems);
      setCartCount(mockItems.reduce((sum, item) => sum + item.quantity, 0));
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [setCartCount]);

  React.useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const onRefresh = () => {
    fetchCart();
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(itemId);
      return;
    }
    setCartItems(prev => {
      const updated = prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );
      setCartCount(updated.reduce((sum, item) => sum + item.quantity, 0));
      return updated;
    });
  };

  const removeItem = (itemId: string) => {
    setCartItems(prev => {
      const item = prev.find(i => i.id === itemId);
      if (item) {
        decrementCartCount();
      }
      return prev.filter(i => i.id !== itemId);
    });
  };

  const applyPromo = () => {
    if (!promoCode.trim()) return;

    const validCodes: Record<string, number> = {
      'WELCOME10': 10,
      'SAVE20': 20,
      'FREESHIP': 0, // Free shipping handled separately
    };

    const discount = validCodes[promoCode.toUpperCase()];
    if (discount !== undefined) {
      setAppliedPromo({ code: promoCode.toUpperCase(), discount });
      Alert.alert('Success', `Promo code "${promoCode.toUpperCase()}" applied!`);
    } else {
      Alert.alert('Invalid Code', 'This promo code is not valid.');
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = appliedPromo ? (subtotal * appliedPromo.discount) / 100 : 0;
  const shipping = subtotal > 100 || appliedPromo?.code === 'FREESHIP' ? 0 : 9.99;
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + shipping + tax;

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    navigation.navigate('Checkout');
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            progressBackgroundColor={theme.colors.card}
          />
        }
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {cartItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={80} color={theme.colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              Your cart is empty
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
              Add some products to get started
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Home')}
              style={styles.continueShoppingButton}
              activeOpacity={0.8}
            >
              <Text style={styles.continueShoppingText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Cart Items */}
            <View style={styles.itemsContainer}>
              {cartItems.map((item) => (
                <View key={item.id} style={styles.cartItem}>
                  <View style={styles.itemImageContainer}>
                    <Image
                      source={{ uri: item.product.image }}
                      style={styles.itemImage}
                      resizeMode="cover"
                    />
                  </View>

                  <View style={styles.itemDetails}>
                    <Text style={[styles.itemSeller, { color: theme.colors.textSecondary }]}>
                      {item.product.seller?.name}
                    </Text>
                    <Text style={[styles.itemName, { color: theme.colors.text }]}>
                      {item.product.name}
                    </Text>

                    {item.product.isFlashSale && item.product.flashSaleEndTime && (
                      <View style={styles.flashSaleRow}>
                        <Ionicons name="flash" size={12} color="#EF4444" />
                        <Text style={styles.flashSaleText}>Flash Sale - Limited time!</Text>
                      </View>
                    )}

                    <View style={styles.itemPriceRow}>
                      <Text style={[styles.itemPrice, { color: theme.colors.text }]}>
                        ${item.product.price.toLocaleString()}
                      </Text>
                      {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                        <Text style={[styles.itemOriginalPrice, { color: theme.colors.textMuted }]}>
                          ${item.product.originalPrice.toLocaleString()}
                        </Text>
                      )}
                    </View>

                    <View style={styles.itemQuantity}>
                      <QuantitySelector
                        value={item.quantity}
                        onChange={qty => updateQuantity(item.id, qty)}
                        variant="compact"
                        max={item.product.stockCount || 99}
                      />
                      <TouchableOpacity
                        onPress={() => removeItem(item.id)}
                        style={styles.removeButton}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="trash-outline" size={20} color={theme.colors.textMuted} />
                        <Text style={[styles.removeText, { color: theme.colors.textMuted }]}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Promo Code */}
            <View style={[styles.promoSection, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.promoTitle, { color: theme.colors.text }]}>Promo Code</Text>
              {appliedPromo ? (
                <View style={styles.appliedPromo}>
                  <View style={styles.appliedPromoInfo}>
                    <Text style={[styles.appliedPromoCode, { color: theme.colors.primary }]}>
                      {appliedPromo.code}
                    </Text>
                    <Text style={[styles.appliedPromoDesc, { color: theme.colors.textSecondary }]}>
                      {appliedPromo.discount > 0
                        ? `${appliedPromo.discount}% off applied`
                        : 'Free shipping applied'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={removePromo} style={styles.removePromoButton} activeOpacity={0.8}>
                    <Ionicons name="close" size={20} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.promoInputContainer}>
                  <TextInput
                    value={promoCode}
                    onChangeText={setPromoCode}
                    placeholder="Enter promo code"
                    style={[
                      styles.promoInput,
                      { color: theme.colors.text, borderColor: theme.colors.border },
                    ]}
                    placeholderTextColor={theme.colors.textMuted}
                    textTransform="uppercase"
                  />
                  <TouchableOpacity onPress={applyPromo} style={styles.applyPromoButton} activeOpacity={0.8}>
                    <Text style={styles.applyPromoText}>Apply</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Order Summary */}
            <View style={[styles.summarySection, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>Order Summary</Text>

              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                  Subtotal ({cartItems.reduce((sum, i) => sum + i.quantity, 0)} items)
                </Text>
                <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                  ${subtotal.toLocaleString()}
                </Text>
              </View>

              {discount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: theme.colors.success }]}>
                    Discount ({appliedPromo?.code})
                  </Text>
                  <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
                    -${discount.toLocaleString()}
                  </Text>
                </View>
              )}

              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                  Shipping
                </Text>
                <Text style={[styles.summaryValue, { color: shipping === 0 ? theme.colors.success : theme.colors.text }]}>
                  {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                  Estimated Tax
                </Text>
                <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                  ${tax.toFixed(2)}
                </Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryRowTotal}>
                <Text style={[styles.summaryLabelTotal, { color: theme.colors.text }]}>Total</Text>
                <Text style={[styles.summaryValueTotal, { color: theme.colors.text }]}>
                  ${total.toFixed(2)}
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleCheckout}
                style={styles.checkoutButton}
                activeOpacity={0.9}
              >
                <Text style={styles.checkoutButtonText}>
                  Proceed to Checkout
                </Text>
              </TouchableOpacity>

              <View style={styles.secureCheckout}>
                <Ionicons name="lock-closed" size={14} color={theme.colors.textMuted} />
                <Text style={[styles.secureText, { color: theme.colors.textMuted }]}>
                  Secure checkout · 30-day returns · Fast shipping
                </Text>
              </View>
            </View>

            {/* Recommended Products */}
            <View style={styles.recommendedSection}>
              <SectionHeader
                title="Recommended for You"
                subtitle="Complete your purchase"
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recommendedContainer}
              >
                {[
                  { id: 'r1', name: 'iPhone 15 Pro Case', price: 49, originalPrice: 59, discount: 17, rating: 4.7, reviewCount: 1234, image: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=400', category: 'Accessories', inStock: true, seller: { id: '1', name: 'Apple Store', rating: 4.9 } },
                  { id: 'r2', name: 'Wireless Charger', price: 39, originalPrice: 49, discount: 20, rating: 4.5, reviewCount: 892, image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400', category: 'Accessories', inStock: true, seller: { id: '2', name: 'Tech Accessories', rating: 4.6 } },
                  { id: 'r3', name: 'Screen Protector', price: 19, originalPrice: 24, discount: 21, rating: 4.6, reviewCount: 2100, image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400', category: 'Accessories', inStock: true, seller: { id: '3', name: 'ScreenGuard', rating: 4.7 } },
                ].map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
                    style={styles.recommendedCard}
                    showQuickAdd
                    onQuickAdd={() => {
                      setCartItems(prev => [...prev, { id: `ci${Date.now()}`, productId: product.id, product: product as Product, quantity: 1, addedAt: new Date().toISOString() }]);
                      setCartCount(c => c + 1);
                    }}
                  />
                ))}
              </ScrollView>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
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
  scrollContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  continueShoppingButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#6366F1',
  },
  continueShoppingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  itemsContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: theme => theme.colors.card,
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    gap: 12,
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemSeller: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  flashSaleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  flashSaleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EF4444',
  },
  itemPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  itemOriginalPrice: {
    fontSize: 13,
    fontWeight: '500',
    textDecorationLine: 'line-through',
  },
  itemQuantity: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  removeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  promoSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  promoInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  promoInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 14,
  },
  applyPromoButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyPromoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  appliedPromo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
  },
  appliedPromoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appliedPromoCode: {
    fontSize: 14,
    fontWeight: '700',
  },
  appliedPromoDesc: {
    fontSize: 12,
    fontWeight: '500',
  },
  removePromoButton: {
    padding: 4,
  },
  summarySection: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  summaryRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  summaryLabelTotal: {
    fontSize: 18,
    fontWeight: '700',
  },
  summaryValueTotal: {
    fontSize: 18,
    fontWeight: '800',
  },
  checkoutButton: {
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secureCheckout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  secureText: {
    fontSize: 12,
    fontWeight: '500',
  },
  recommendedSection: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  recommendedContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 4,
  },
  recommendedCard: {
    width: 160,
  },
});