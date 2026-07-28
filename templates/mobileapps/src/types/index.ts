export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  image: string;
  images?: string[];
  category: string;
  subcategory?: string;
  description?: string;
  shortDescription?: string;
  isFlashSale?: boolean;
  flashSaleEndTime?: number;
  inStock: boolean;
  stockCount?: number;
  sku?: string;
  brand?: string;
  tags?: string[];
  specifications?: Record<string, string>;
  variants?: ProductVariant[];
  seller: Seller;
  shippingInfo?: ShippingInfo;
  returnPolicy?: ReturnPolicy;
  warranty?: WarrantyInfo;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  price?: number;
  inStock: boolean;
  image?: string;
}

export interface Seller {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  avatar?: string;
  verified: boolean;
  responseTime?: string;
  joinedAt: string;
  location?: string;
}

export interface ShippingInfo {
  freeShipping: boolean;
  estimatedDays: number;
  cost?: number;
  expressAvailable: boolean;
  expressCost?: number;
  expressDays?: number;
}

export interface ReturnPolicy {
  days: number;
  freeReturns: boolean;
  conditions?: string;
}

export interface WarrantyInfo {
  period: number;
  periodUnit: 'days' | 'months' | 'years';
  type: 'manufacturer' | 'seller' | 'extended';
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  parentId?: string;
  productCount: number;
  children?: Category[];
  featured?: boolean;
  sortOrder?: number;
}

export interface Banner {
  id: string;
  image: string;
  title?: string;
  subtitle?: string;
  actionUrl?: string;
  actionType?: 'product' | 'category' | 'url' | 'search';
  actionId?: string;
  sortOrder: number;
  active: boolean;
  startDate?: string;
  endDate?: string;
}

export interface FlashSale {
  id: string;
  productId: string;
  product: Product;
  startTime: string;
  endTime: string;
  discountPercent: number;
  quantityLimit?: number;
  soldQuantity: number;
  maxPerUser?: number;
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  wishlist: string[];
  recentlyViewed: string[];
  loyaltyPoints: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  referralCode: string;
  referredBy?: string;
  notifications: NotificationSettings;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'wallet' | 'bank' | 'cod';
  card?: CardDetails;
  wallet?: WalletDetails;
  bank?: BankDetails;
  isDefault: boolean;
  nickname?: string;
}

export interface CardDetails {
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  token: string;
}

export interface WalletDetails {
  provider: string;
  balance: number;
  currency: string;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  ifsc?: string;
  accountHolderName: string;
}

export interface NotificationSettings {
  push: boolean;
  email: boolean;
  sms: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  priceDrops: boolean;
  backInStock: boolean;
  recommendations: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  variantId?: string;
  variant?: ProductVariant;
  addedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  tax: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  shippingAddress: Address;
  billingAddress?: Address;
  trackingInfo?: TrackingInfo;
  notes?: string;
  couponCode?: string;
  loyaltyPointsUsed?: number;
  loyaltyPointsEarned?: number;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
  cancelledAt?: string;
  returnRequestedAt?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  variantId?: string;
  variantName?: string;
  price: number;
  quantity: number;
  total: number;
  sellerId: string;
  sellerName: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

export interface TrackingInfo {
  carrier: string;
  trackingNumber: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  events: TrackingEvent[];
}

export interface TrackingEvent {
  timestamp: string;
  status: string;
  location?: string;
  description: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  userLimit?: number;
  validFrom: string;
  validUntil: string;
  applicableCategories?: string[];
  applicableProducts?: string[];
  firstTimeUserOnly?: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  verifiedPurchase: boolean;
  helpfulCount: number;
  reply?: ReviewReply;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewReply {
  id: string;
  reviewId: string;
  sellerId: string;
  sellerName: string;
  comment: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderType: 'user' | 'seller' | 'support' | 'system';
  message: string;
  type: 'text' | 'image' | 'product' | 'order' | 'file';
  attachments?: MessageAttachment[];
  read: boolean;
  createdAt: string;
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'file' | 'product' | 'order';
  url: string;
  name?: string;
  size?: number;
  mimeType?: string;
}

export interface Conversation {
  id: string;
  participants: ConversationParticipant[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  type: 'support' | 'seller' | 'order';
  relatedOrderId?: string;
  relatedProductId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationParticipant {
  id: string;
  name: string;
  avatar?: string;
  type: 'user' | 'seller' | 'support';
  online?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export type NotificationType =
  | 'order_placed'
  | 'order_confirmed'
  | 'order_shipped'
  | 'order_delivered'
  | 'order_cancelled'
  | 'payment_success'
  | 'payment_failed'
  | 'refund_processed'
  | 'price_drop'
  | 'back_in_stock'
  | 'new_message'
  | 'review_request'
  | 'promotion'
  | 'flash_sale'
  | 'loyalty_points'
  | 'referral_bonus'
  | 'system';

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  transactions: WalletTransaction[];
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  referenceType?: 'order' | 'refund' | 'referral' | 'promotion' | 'withdrawal';
  referenceId?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  refereeId?: string;
  code: string;
  status: 'pending' | 'completed' | 'expired';
  rewardAmount: number;
  rewardType: 'wallet_credit' | 'discount' | 'points';
  createdAt: string;
  completedAt?: string;
}

export interface LoyaltyProgram {
  id: string;
  userId: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  lifetimePoints: number;
  nextTierPoints: number;
  benefits: LoyaltyBenefit[];
  history: LoyaltyHistory[];
}

export interface LoyaltyBenefit {
  id: string;
  tier: string;
  benefit: string;
  description: string;
  active: boolean;
}

export interface LoyaltyHistory {
  id: string;
  type: 'earned' | 'redeemed' | 'expired' | 'tier_upgrade';
  points: number;
  description: string;
  referenceId?: string;
  createdAt: string;
}

export interface AppSettings {
  currency: string;
  language: string;
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;
  autoPlayVideos: boolean;
  dataSaverMode: boolean;
  biometricAuth: boolean;
}

export interface SearchFilters {
  query?: string;
  categoryId?: string;
  subcategoryId?: string;
  brandIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
  freeShipping?: boolean;
  onSale?: boolean;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popular';
  page?: number;
  limit?: number;
}

export interface SearchResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: SearchFilters;
  facets: SearchFacets;
}

export interface SearchFacets {
  categories: FacetCount[];
  brands: FacetCount[];
  priceRanges: FacetCount[];
  ratings: FacetCount[];
}

export interface FacetCount {
  id: string;
  name: string;
  count: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: Record<string, any>;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface AppConfig {
  appName: string;
  version: string;
  buildNumber: string;
  apiBaseUrl: string;
  imageBaseUrl: string;
  supportEmail: string;
  supportPhone: string;
  termsUrl: string;
  privacyUrl: string;
  refundPolicyUrl: string;
  shippingPolicyUrl: string;
  features: FeatureFlags;
  socialLinks: SocialLinks;
}

export interface FeatureFlags {
  chatEnabled: boolean;
  wishlistEnabled: boolean;
  walletEnabled: boolean;
  referralEnabled: boolean;
  loyaltyEnabled: boolean;
  flashSaleEnabled: boolean;
  reviewsEnabled: boolean;
  compareEnabled: boolean;
  recentlyViewedEnabled: boolean;
  guestCheckoutEnabled: boolean;
  codEnabled: boolean;
  walletPaymentsEnabled: boolean;
  upiPaymentsEnabled: boolean;
  cardPaymentsEnabled: boolean;
  netBankingEnabled: boolean;
  emiEnabled: boolean;
}

export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
  telegram?: string;
}

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  systemName: string;
  systemVersion: string;
  model: string;
  brand: string;
  isDevice: boolean;
  isTablet: boolean;
  hasNotch: boolean;
  appVersion: string;
  buildNumber: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  timestamp: number;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: string;
  badge?: number;
  categoryId?: string;
  threadId?: string;
  contentAvailable?: boolean;
  mutableContent?: boolean;
}

export interface Banner {
  id: string;
  image: string;
  title?: string;
  subtitle?: string;
  actionUrl?: string;
  actionType?: 'product' | 'category' | 'url' | 'search';
  actionId?: string;
  sortOrder?: number;
  active?: boolean;
  startDate?: string;
  endDate?: string;
}

// Simplified Product type for use in list/card contexts
export interface ProductSummary {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
  isFlashSale?: boolean;
  flashSaleEndTime?: number;
  inStock: boolean;
  seller?: {
    id: string;
    name: string;
    rating: number;
  };
}