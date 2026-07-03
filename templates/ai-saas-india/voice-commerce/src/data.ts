import type { LanguageOption, Product } from "./types";

export const LANGUAGES: LanguageOption[] = [
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", flag: "🇮🇳" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", flag: "🇮🇳" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", flag: "🇮🇳" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", flag: "🇮🇳" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ", flag: "🇮🇳" },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া", flag: "🇮🇳" },
  { code: "en", name: "English", nativeName: "English", flag: "🌐" },
];

export const GRADIENT_CLASSES = [
  "card-gradient-1",
  "card-gradient-2",
  "card-gradient-3",
  "card-gradient-4",
  "card-gradient-5",
  "card-gradient-6",
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "ondc-001",
    name: "Fortune Refined Sunflower Oil 1L",
    price: 145,
    currency: "INR",
    description: "Premium refined sunflower oil, rich in Vitamin E. Ideal for daily cooking.",
    category: "Groceries",
    imageGradient: "card-gradient-1",
    seller: "BigBasket Local",
    rating: 4.5,
    deliveryDays: 2,
  },
  {
    id: "ondc-002",
    name: "Tata Sampann Turmeric Powder 500g",
    price: 89,
    currency: "INR",
    description: "100% pure turmeric with high curcumin content. No added colours.",
    category: "Groceries",
    imageGradient: "card-gradient-2",
    seller: "JioMart",
    rating: 4.3,
    deliveryDays: 3,
  },
  {
    id: "ondc-003",
    name: "Amul Taaza Toned Milk 500ml",
    price: 32,
    currency: "INR",
    description: "Fresh toned milk, pasteurised and homogenised. Packed with calcium.",
    category: "Dairy",
    imageGradient: "card-gradient-3",
    seller: "DMart Ready",
    rating: 4.6,
    deliveryDays: 1,
  },
  {
    id: "ondc-004",
    name: "Saffola Gold Refined Cooking Oil 1L",
    price: 199,
    currency: "INR",
    description: "Heart-healthy cooking oil with immune booster. 2x antioxidants.",
    category: "Groceries",
    imageGradient: "card-gradient-4",
    seller: "SpiceMart",
    rating: 4.4,
    deliveryDays: 2,
  },
  {
    id: "ondc-005",
    name: "Aashirvaad Atta with Multi Grains 5kg",
    price: 285,
    currency: "INR",
    description: "Whole wheat atta blended with 6 nutritious grains for a healthier family.",
    category: "Groceries",
    imageGradient: "card-gradient-5",
    seller: "More Megastore",
    rating: 4.7,
    deliveryDays: 3,
  },
  {
    id: "ondc-006",
    name: "Haldiram's Aloo Bhujia 200g",
    price: 55,
    currency: "INR",
    description: "Crispy, spicy potato-based snack. A beloved namkeen for every household.",
    category: "Snacks",
    imageGradient: "card-gradient-6",
    seller: "BB Instant",
    rating: 4.2,
    deliveryDays: 2,
  },
];

export const SAMPLE_VOICE_QUERIES: Record<string, string[]> = {
  hi: [
    "मुझे तेल और मसाले चाहिए",
    "दूध और घर का सामान लाना है",
    "चाय पत्ती और चीनी चाहिए",
    "फल और सब्ज़ियाँ मँगवाओ",
  ],
  kn: [
    "ನನಗೆ ಎಣ್ಣೆ ಮತ್ತು ಮಸಾಲೆ ಬೇಕು",
    "ಹಾಲು ಮತ್ತು ಮನೆಯ ಸಾಮಗ್ರಿ ತನ್ನಿ",
    "ತರಕಾರಿ ಮತ್ತು ಹಣ್ಣು ಬೇಕು",
  ],
  ta: [
    "எனக்கு எண்ணெய் மற்றும் மசாலா வேண்டும்",
    "பால் மற்றும் வீட்டு பொருட்கள் வேண்டும்",
  ],
  te: [
    "నాకు నూనె మరియు మసాలా కావాలి",
    "పాలు మరియు ఇంటి సరుకులు కావాలి",
  ],
  bn: [
    "আমার তেল এবং মশলা দরকার",
    "দুধ এবং ঘরের সামগ্রী দরকার",
  ],
  en: [
    "I need cooking oil and spices",
    "Get me milk and household items",
    "Looking for fresh fruits and vegetables",
    "I want snacks and namkeen",
  ],
};

export const FEATURES = [
  {
    icon: "mic" as const,
    title: "Voice Commerce",
    titleHi: "वॉइस कॉमर्स",
    description: "Search and shop using your natural voice in any Indian language. Just speak like you talk to a local shopkeeper.",
  },
  {
    icon: "brain" as const,
    title: "Regional NLP",
    titleHi: "क्षेत्रीय NLP",
    description: "Advanced natural language processing tuned for Indian languages — understands dialects, slang, and mixed-language queries.",
  },
  {
    icon: "network" as const,
    title: "ONDC Integration",
    titleHi: "ONDC एकीकरण",
    description: "Connected to the Open Network for Digital Commerce. Compare prices across multiple sellers in your locality.",
  },
  {
    icon: "indian-rupee" as const,
    title: "UPI Voice-Pay",
    titleHi: "UPI वॉइस-पे",
    description: "Pay securely with UPI voice commands. No typing card details — just confirm with your voice and PIN.",
  },
];

export const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Select Language",
    titleHi: "भाषा चुनें",
    description: "Choose from 12 Indian languages. Your entire shopping experience stays in your mother tongue.",
  },
  {
    step: 2,
    title: "Speak or Type",
    titleHi: "बोलें या टाइप करें",
    description: "Tell us what you need — in your language. 'Mujhe 1 litre tel chahiye' works just as well as 'I need 1L oil'.",
  },
  {
    step: 3,
    title: "Compare & Choose",
    titleHi: "तुलना करें और चुनें",
    description: "See products from multiple ONDC sellers with real prices, ratings, and delivery times.",
  },
  {
    step: 4,
    title: "Pay with UPI Voice",
    titleHi: "UPI वॉइस से भुगतान",
    description: "Confirm your order and pay with UPI. Voice-verified for security. No app switching needed.",
  },
];

export const PRICING_PLANS = [
  {
    name: "Starter",
    nameHi: "शुरुआत",
    price: 0,
    period: "forever",
    description: "Perfect for trying out voice shopping",
    features: [
      "5 voice searches per day",
      "3 languages",
      "Basic product comparison",
      "ONDC price display",
    ],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Shopkeeper",
    nameHi: "दुकानदार",
    price: 99,
    period: "/month",
    description: "For regular shoppers who want the best deals",
    features: [
      "Unlimited voice searches",
      "All 12 languages",
      "Advanced NLP with slang support",
      "Price alerts & deals",
      "UPI voice-pay integration",
      "Order history in your language",
    ],
    cta: "Start Shopping",
    highlighted: true,
  },
  {
    name: "Business",
    nameHi: "व्यापार",
    price: 499,
    period: "/month",
    description: "For sellers and shops on ONDC",
    features: [
      "Everything in Shopkeeper",
      "Multi-language product listings",
      "Voice-based inventory management",
      "Customer analytics dashboard",
      "API access for ONDC integration",
      "Dedicated support in your language",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];
