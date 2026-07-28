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
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons, MaterialIcons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useAppTheme, useAppStore } from '../providers/Providers';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { CartItem, Address, PaymentMethod } from '../types';
import { QuantitySelector } from '../components/QuantitySelector';

type CheckoutScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Checkout'>;
type CheckoutScreenRouteProp = RouteProp<RootStackParamList, 'Checkout'>;

export const CheckoutScreen = () => {
  const navigation = useNavigation<CheckoutScreenNavigationProp>();
  const route = useRoute<CheckoutScreenRouteProp>();
  const theme = useAppTheme();
  const { cartCount, setCartCount } = useAppStore();
  const fromCart = route.params?.fromCart;
  const buyNowProduct = route.params?.buyNowProduct;

  const [step, setStep] = useState<'shipping' | 'payment' | 'review' | 'confirmation'>('shipping');
  const [loading, setLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('addr1');
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>('pm1');
  const [newAddress, setNewAddress] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'USA',
    isDefault: false,
  });
  const [showAddAddress, setShowAddAddress] = useState(false);

  // Mock data
  const addresses: Address[] = [
    {
      id: 'addr1',
      type: 'home',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1 555-123-4567',
      addressLine1: '123 Main Street',
      addressLine2: 'Apt 4B',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94102',
      country: 'USA',
      isDefault: true,
    },
    {
      id: 'addr2',
      type: 'work',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1 555-123-4567',
      addressLine1: '456 Market Street',
      addressLine2: 'Suite 100',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      country: 'USA',
      isDefault: false,
    },
  ];

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'pm1',
      type: 'card',
      card: {
        last4: '4242',
        brand: 'Visa',
        expiryMonth: 12,
        expiryYear: 2027,
        token: 'tok_visa',
      },
      isDefault: true,
      nickname: 'Personal Card',
    },
    {
      id: 'pm2',
      type: 'card',
      card: {
        last4: '5555',
        brand: 'Mastercard',
        expiryMonth: 6,
        expiryYear: 2026,
        token: 'tok_mc',
      },
      isDefault: false,
      nickname: 'Business Card',
    },
    {
      id: 'pm3',
      type: 'wallet',
      wallet: {
        provider: 'Apple Pay',
        balance: 0,
        currency: 'USD',
      },
      isDefault: false,
    },
  ];

  const cartItems: CartItem[] = fromCart
    ? [
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
      ]
    : buyNowProduct
    ? [
        {
          id: `ci_${Date.now()}`,
          productId: buyNowProduct,
          product: {
            id: buyNowProduct,
            name: 'iPhone 15 Pro Max 256GB',
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
      ]
    : [];

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleContinue = () => {
    if (step === 'shipping') {
      setStep('payment');
    } else if (step === 'payment') {
      setStep('review');
    }
  };

  const handleBack = () => {
    if (step === 'payment') {
      setStep('shipping');
    } else if (step === 'review') {
      setStep('payment');
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      Alert.alert(
        'Order Placed!',
        'Your order has been confirmed. You will receive a confirmation email shortly.',
        [{ text: 'View Orders', onPress: () => navigation.navigate('Orders') }]
      );
      setCartCount(0);
      navigation.navigate('Orders');
    } catch (error) {
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);
  const selectedPayment = paymentMethods.find(p => p.id === selectedPaymentId);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Processing your order...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Steps */}
          <View style={styles.progressContainer}>
            {[
              { key: 'shipping', label: 'Shipping', number: 1 },
              { key: 'payment', label: 'Payment', number: 2 },
              { key: 'review', label: 'Review', number: 3 },
            ].map((stepInfo, index) => (
              <View key={stepInfo.key} style={styles.progressItem}>
                <View
                  style={[
                    styles.progressCircle,
                    (step === stepInfo.key || ['shipping', 'payment', 'review'].indexOf(step) > index)
                      ? styles.progressCircleActive
                      : {},
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  <Text style={styles.progressNumber}>
                    {['shipping', 'payment', 'review'].indexOf(step) > index
                      ? '✓'
                      : stepInfo.number}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.progressLabel,
                    step === stepInfo.key ? styles.progressLabelActive : {},
                    { color: theme.colors.text },
                  ]}
                >
                  {stepInfo.label}
                </Text>
                {index < 2 && (
                  <View
                    style={[
                      styles.progressLine,
                      ['shipping', 'payment', 'review'].indexOf(step) > index
                        ? styles.progressLineActive
                        : {},
                    ]}
                  />
                )}
              </View>
            ))}
          </View>

          {/* Shipping Step */}
          {step === 'shipping' && (
            <View style={styles.stepContainer}>
              <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Shipping Address</Text>
              <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
                Select or add a delivery address
              </Text>

              {addresses.map((address) => (
                <TouchableOpacity
                  key={address.id}
                  onPress={() => setSelectedAddressId(address.id)}
                  style={[
                    styles.addressCard,
                    selectedAddressId === address.id && styles.addressCardSelected,
                    { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                  ]}
                  activeOpacity={0.9}
                >
                  <View style={styles.addressCardContent}>
                    <View style={[
                      styles.addressRadio,
                      selectedAddressId === address.id && styles.addressRadioSelected,
                      { borderColor: theme.colors.primary },
                    ]}>
                      {selectedAddressId === address.id && (
                        <View style={styles.addressRadioInner} />
                      )}
                    </View>
                    <View style={styles.addressInfo}>
                      <View style={styles.addressHeader}>
                        <Text style={[styles.addressName, { color: theme.colors.text }]}>
                          {address.firstName} {address.lastName}
                        </Text>
                        {address.isDefault && (
                          <View style={styles.defaultBadge}>
                            <Text style={styles.defaultBadgeText}>Default</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.addressPhone, { color: theme.colors.textSecondary }]}>
                        {address.phone}
                      </Text>
                      <Text style={[styles.addressLine, { color: theme.colors.textSecondary }]}>
                        {address.addressLine1}
                        {address.addressLine2 && `, ${address.addressLine2}`}
                      </Text>
                      <Text style={[styles.addressLine, { color: theme.colors.textSecondary }]}>
                        {address.city}, {address.state} {address.postalCode}, {address.country}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                onPress={() => setShowAddAddress(true)}
                style={styles.addAddressButton}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={20} color={theme.colors.primary} />
                <Text style={[styles.addAddressText, { color: theme.colors.primary }]}>Add New Address</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Payment Step */}
          {step === 'payment' && (
            <View style={styles.stepContainer}>
              <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Payment Method</Text>
              <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
                Choose how you'd like to pay
              </Text>

              {paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  onPress={() => setSelectedPaymentId(method.id)}
                  style={[
                    styles.paymentCard,
                    selectedPaymentId === method.id && styles.paymentCardSelected,
                    { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                  ]}
                  activeOpacity={0.9}
                >
                  <View style={styles.paymentCardContent}>
                    <View style={[
                      styles.paymentRadio,
                      selectedPaymentId === method.id && styles.paymentRadioSelected,
                      { borderColor: theme.colors.primary },
                    ]}>
                      {selectedPaymentId === method.id && (
                        <View style={styles.paymentRadioInner} />
                      )}
                    </View>
                    <View style={styles.paymentInfo}>
                      {method.type === 'card' && method.card && (
                        <>
                          <View style={styles.cardIcons}>
                            <View style={styles.cardIcon}>
                              <Text style={styles.cardBrand}>{method.card.brand}</Text>
                            </View>
                            <Text style={[styles.cardNumber, { color: theme.colors.text }]}>
                              **** **** **** {method.card.last4}
                            </Text>
                          </View>
                          <Text style={[styles.cardExpiry, { color: theme.colors.textSecondary }]}>
                            Expires {method.card.expiryMonth.toString().padStart(2, '0')}/{method.card.expiryYear.toString().slice(-2)}
                          </Text>
                        </>
                      )}
                      {method.type === 'wallet' && method.wallet && (
                        <View style={styles.walletInfo}>
                          <Text style={[styles.walletName, { color: theme.colors.text }]}>
                            {method.wallet.provider}
                          </Text>
                          <Text style={[styles.walletBalance, { color: theme.colors.textSecondary }]}>
                            Balance: ${method.wallet.balance.toFixed(2)}
                          </Text>
                        </View>
                      )}
                    </View>
                    {method.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Default</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                onPress={() => Alert.alert('Add payment method', 'Feature coming soon')}
                style={styles.addPaymentButton}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={20} color={theme.colors.primary} />
                <Text style={[styles.addPaymentText, { color: theme.colors.primary }]}>Add Payment Method</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Review Step */}
          {step === 'review' && (
            <View style={styles.stepContainer}>
              <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Review Order</Text>
              <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
                Please review your order details
              </Text>

              {/* Shipping Address Summary */}
              <View style={[styles.reviewCard, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.reviewCardTitle, { color: theme.colors.text }]}>Shipping To</Text>
                {selectedAddress && (
                  <Text style={[styles.reviewAddress, { color: theme.colors.textSecondary }]}>
                    {selectedAddress.firstName} {selectedAddress.lastName}{'\n'}
                    {selectedAddress.addressLine1}
                    {selectedAddress.addressLine2 && `, ${selectedAddress.addressLine2}`}{'\n'}
                    {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode}{'\n'}
                    {selectedAddress.country}{'\n'}
                    {selectedAddress.phone}
                  </Text>
                )}
                <TouchableOpacity
                  onPress={() => setStep('shipping')}
                  style={styles.changeLink}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.changeLinkText, { color: theme.colors.primary }]}>Change</Text>
                </TouchableOpacity>
              </View>

              {/* Payment Method Summary */}
              <View style={[styles.reviewCard, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.reviewCardTitle, { color: theme.colors.text }]}>Payment Method</Text>
                {selectedPayment && selectedPayment.type === 'card' && selectedPayment.card && (
                  <Text style={[styles.reviewAddress, { color: theme.colors.textSecondary }]}>
                    {selectedPayment.card.brand} ending in {selectedPayment.card.last4}
                  </Text>
                )}
                {selectedPayment && selectedPayment.type === 'wallet' && selectedPayment.wallet && (
                  <Text style={[styles.reviewAddress, { color: theme.colors.textSecondary }]}>
                    {selectedPayment.wallet.provider}
                  </Text>
                )}
                <TouchableOpacity
                  onPress={() => setStep('payment')}
                  style={styles.changeLink}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.changeLinkText, { color: theme.colors.primary }]}>Change</Text>
                </TouchableOpacity>
              </View>

              {/* Order Items */}
              <View style={[styles.reviewCard, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.reviewCardTitle, { color: theme.colors.text }]}>Order Items</Text>
                {cartItems.map((item) => (
                  <View key={item.id} style={styles.reviewItem}>
                    <Image
                      source={{ uri: item.product.image }}
                      style={styles.reviewItemImage}
                      resizeMode="cover"
                    />
                    <View style={styles.reviewItemDetails}>
                      <Text style={[styles.reviewItemName, { color: theme.colors.text }]}>
                        {item.product.name}
                      </Text>
                      <Text style={[styles.reviewItemQty, { color: theme.colors.textSecondary }]}>
                        Qty: {item.quantity}
                      </Text>
                    </View>
                    <Text style={[styles.reviewItemPrice, { color: theme.colors.text }]}>
                      ${(item.product.price * item.quantity).toLocaleString()}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Order Summary */}
              <View style={[styles.reviewCard, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.reviewCardTitle, { color: theme.colors.text }]}>Order Summary</Text>

                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                    Subtotal ({cartItems.reduce((sum, i) => sum + i.quantity, 0)} items)
                  </Text>
                  <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                    ${subtotal.toLocaleString()}
                  </Text>
                </View>

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
                    Tax
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
              </View>

              <TouchableOpacity
                onPress={handlePlaceOrder}
                disabled={loading}
                style={[
                  styles.placeOrderButton,
                  loading && styles.placeOrderButtonDisabled,
                ]}
                activeOpacity={0.9}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.placeOrderButtonText}>Place Order</Text>
                )}
              </TouchableOpacity>

              <View style={styles.secureCheckout}>
                <Ionicons name="lock-closed" size={14} color={theme.colors.textMuted} />
                <Text style={[styles.secureText, { color: theme.colors.textMuted }]}>
                  Secure checkout · 30-day returns · Fast shipping
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Navigation Buttons */}
        {step !== 'review' && (
          <View style={styles.bottomNav}>
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleContinue}
              style={[
                styles.continueButton,
                { backgroundColor: theme.colors.primary },
              ]}
              activeOpacity={0.9}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
              <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Add Address Modal */}
      <Modal
        visible={showAddAddress}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddAddress(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Address</Text>
            <TouchableOpacity onPress={() => setShowAddAddress(false)} style={styles.modalClose} activeOpacity={0.8}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.colors.text }]}>First Name *</Text>
              <TextInput
                value={newAddress.firstName}
                onChangeText={text => setNewAddress({ ...newAddress, firstName: text })}
                style={[
                  styles.formInput,
                  { color: theme.colors.text, borderColor: theme.colors.border },
                ]}
                placeholder="John"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.colors.text }]}>Last Name *</Text>
              <TextInput
                value={newAddress.lastName}
                onChangeText={text => setNewAddress({ ...newAddress, lastName: text })}
                style={[
                  styles.formInput,
                  { color: theme.colors.text, borderColor: theme.colors.border },
                ]}
                placeholder="Doe"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.colors.text }]}>Phone *</Text>
              <TextInput
                value={newAddress.phone}
                onChangeText={text => setNewAddress({ ...newAddress, phone: text })}
                style={[
                  styles.formInput,
                  { color: theme.colors.text, borderColor: theme.colors.border },
                ]}
                placeholder="+1 555-123-4567"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.colors.text }]}>Address Line 1 *</Text>
              <TextInput
                value={newAddress.addressLine1}
                onChangeText={text => setNewAddress({ ...newAddress, addressLine1: text })}
                style={[
                  styles.formInput,
                  { color: theme.colors.text, borderColor: theme.colors.border },
                ]}
                placeholder="123 Main Street"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.colors.text }]}>Address Line 2</Text>
              <TextInput
                value={newAddress.addressLine2}
                onChangeText={text => setNewAddress({ ...newAddress, addressLine2: text })}
                style={[
                  styles.formInput,
                  { color: theme.colors.text, borderColor: theme.colors.border },
                ]}
                placeholder="Apt, Suite, Floor (optional)"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>
            <View style={styles.formRow}>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.colors.text }]}>City *</Text>
                <TextInput
                  value={newAddress.city}
                  onChangeText={text => setNewAddress({ ...newAddress, city: text })}
                  style={[
                    styles.formInput,
                    { color: theme.colors.text, borderColor: theme.colors.border },
                  ]}
                  placeholder="San Francisco"
                  placeholderTextColor={theme.colors.textMuted}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.colors.text }]}>State *</Text>
                <TextInput
                  value={newAddress.state}
                  onChangeText={text => setNewAddress({ ...newAddress, state: text })}
                  style={[
                    styles.formInput,
                    { color: theme.colors.text, borderColor: theme.colors.border },
                  ]}
                  placeholder="CA"
                  placeholderTextColor={theme.colors.textMuted}
                />
              </View>
            </View>
            <View style={styles.formRow}>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.colors.text }]}>ZIP Code *</Text>
                <TextInput
                  value={newAddress.postalCode}
                  onChangeText={text => setNewAddress({ ...newAddress, postalCode: text })}
                  style={[
                    styles.formInput,
                    { color: theme.colors.text, borderColor: theme.colors.border },
                  ]}
                  placeholder="94102"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.colors.text }]}>Country *</Text>
                <TextInput
                  value={newAddress.country}
                  onChangeText={text => setNewAddress({ ...newAddress, country: text })}
                  style={[
                    styles.formInput,
                    { color: theme.colors.text, borderColor: theme.colors.border },
                  ]}
                  placeholder="USA"
                  placeholderTextColor={theme.colors.textMuted}
                />
              </View>
            </View>
            <View style={styles.formGroupCheckbox}>
              <TouchableOpacity
                onPress={() => setNewAddress({ ...newAddress, isDefault: !newAddress.isDefault })}
                style={[
                  styles.checkbox,
                  newAddress.isDefault && styles.checkboxChecked,
                  { borderColor: theme.colors.primary },
                ]}
                activeOpacity={0.8}
              >
                {newAddress.isDefault && (
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
              <Text style={[styles.checkboxLabel, { color: theme.colors.text }]}>Set as default address</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                // Add address logic
                setShowAddAddress(false);
                setNewAddress({
                  firstName: '',
                  lastName: '',
                  phone: '',
                  addressLine1: '',
                  addressLine2: '',
                  city: '',
                  state: '',
                  postalCode: '',
                  country: 'USA',
                  isDefault: false,
                });
              }}
              style={[
                styles.saveAddressButton,
                { backgroundColor: theme.colors.primary },
              ]}
              activeOpacity={0.9}
            >
              <Text style={styles.saveAddressButtonText}>Save Address</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  progressItem: {
    flex: 1,
    alignItems: 'center',
  },
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressCircleActive: {
    backgroundColor: '#6366F1',
  },
  progressNumber: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  progressLabelActive: {
    fontWeight: '700',
    color: '#6366F1',
  },
  progressLine: {
    position: 'absolute',
    top: 16,
    left: '50%',
    right: -50,
    height: 2,
    backgroundColor: '#E2E8F0',
  },
  progressLineActive: {
    backgroundColor: '#6366F1',
  },
  stepContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 20,
  },
  addressCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  addressCardSelected: {
    borderWidth: 2,
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  addressCardContent: {
    flexDirection: 'row',
    gap: 12,
  },
  addressRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  addressRadioSelected: {
    borderColor: '#6366F1',
  },
  addressRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6366F1',
  },
  addressInfo: {
    flex: 1,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  addressName: {
    fontSize: 15,
    fontWeight: '600',
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#6366F1',
  },
  defaultBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  addressPhone: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  addressLine: {
    fontSize: 13,
    lineHeight: 20,
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#6366F1',
    marginTop: 8,
  },
  addAddressText: {
    fontSize: 15,
    fontWeight: '600',
  },
  paymentCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  paymentCardSelected: {
    borderWidth: 2,
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  paymentCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentRadioSelected: {
    borderColor: '#6366F1',
  },
  paymentRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6366F1',
  },
  paymentInfo: {
    flex: 1,
  },
  cardIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardIcon: {
    width: 40,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBrand: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  cardNumber: {
    fontSize: 15,
    fontWeight: '600',
  },
  cardExpiry: {
    fontSize: 13,
    fontWeight: '500',
  },
  walletInfo: {
    gap: 2,
  },
  walletName: {
    fontSize: 15,
    fontWeight: '600',
  },
  walletBalance: {
    fontSize: 13,
    fontWeight: '500',
  },
  addPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#6366F1',
    marginTop: 8,
  },
  addPaymentText: {
    fontSize: 15,
    fontWeight: '600',
  },
  reviewCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  reviewCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reviewAddress: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },
  changeLink: {
    paddingTop: 8,
  },
  changeLinkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  reviewItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  reviewItemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  reviewItemName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  reviewItemQty: {
    fontSize: 13,
    fontWeight: '500',
  },
  reviewItemPrice: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
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
    paddingVertical: 10,
  },
  summaryLabelTotal: {
    fontSize: 16,
    fontWeight: '700',
  },
  summaryValueTotal: {
    fontSize: 18,
    fontWeight: '800',
  },
  placeOrderButton: {
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    alignItems: 'center',
  },
  placeOrderButtonDisabled: {
    opacity: 0.7,
  },
  placeOrderButtonText: {
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
  bottomNav: {
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
    justifyContent: 'space-between',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  // Modal styles
  modalContainer: {
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
  modalClose: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
    paddingBottom: 40,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formRow > View: {
    flex: 1,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  formInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 15,
  },
  formGroupCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveAddressButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveAddressButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});