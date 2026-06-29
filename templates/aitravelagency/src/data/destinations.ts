export interface Destination {
  id: string;
  name: string;
  country: string;
  tagline: string;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  avgCost: number;
  bestSeason: string;
  highlights: string[];
  category: 'beach' | 'mountain' | 'city' | 'cultural' | 'adventure' | 'island';
  lat: number;
  lng: number;
}

export interface Hotel {
  id: string;
  name: string;
  destinationId: string;
  stars: number;
  pricePerNight: number;
  rating: number;
  reviewCount: number;
  amenities: string[];
  description: string;
  image: string;
  available: boolean;
}

export interface TripPlan {
  id: string;
  name: string;
  destinationId: string;
  days: number;
  price: number;
  description: string;
  itinerary: ItineraryDay[];
  included: string[];
  category: 'budget' | 'standard' | 'premium' | 'luxury';
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
  meals: string[];
  accommodation: string;
}

export interface Booking {
  id: string;
  destinationId: string;
  hotelId?: string;
  tripPlanId?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalCost: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  notes: string;
}

export interface FollowUpMessage {
  id: string;
  bookingId: string;
  sender: 'client' | 'agent';
  message: string;
  timestamp: string;
  read: boolean;
}

export const destinations: Destination[] = [
  {
    id: 'bali',
    name: 'Bali',
    country: 'Indonesia',
    tagline: 'Island of the Gods',
    description: 'Discover pristine beaches, ancient temples, lush rice terraces, and vibrant culture in Indonesia\'s most iconic island paradise.',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
    rating: 4.8,
    reviewCount: 2340,
    avgCost: 65000,
    bestSeason: 'April - October',
    highlights: ['Ubud Rice Terraces', 'Tanah Lot Temple', 'Seminyak Beach', 'Mount Batur Sunrise Trek', 'Uluwatu Kecak Dance'],
    category: 'island',
    lat: -8.3405,
    lng: 115.092,
  },
  {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    tagline: 'City of Lights',
    description: 'Experience the romance, art, and culinary excellence of the world\'s most enchanting city. From the Eiffel Tower to hidden bistros.',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
    rating: 4.7,
    reviewCount: 3120,
    avgCost: 85000,
    bestSeason: 'April - June, September - November',
    highlights: ['Eiffel Tower', 'Louvre Museum', 'Montmartre', 'Seine River Cruise', 'Versailles Palace'],
    category: 'city',
    lat: 48.8566,
    lng: 2.3522,
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    tagline: 'Where Tradition Meets Future',
    description: 'Dive into the electric energy of Tokyo — ancient shrines next to neon-lit skyscrapers, world-class sushi, and cherry blossoms.',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    rating: 4.9,
    reviewCount: 2890,
    avgCost: 90000,
    bestSeason: 'March - May, October - November',
    highlights: ['Shibuya Crossing', 'Senso-ji Temple', 'Tsukiji Fish Market', 'Mount Fuji Day Trip', 'Akihabara'],
    category: 'city',
    lat: 35.6762,
    lng: 139.6503,
  },
  {
    id: 'swiss-alps',
    name: 'Swiss Alps',
    country: 'Switzerland',
    tagline: 'Heaven on Earth',
    description: 'Majestic peaks, pristine lakes, and charming villages. The Swiss Alps offer breathtaking scenery and world-class adventure sports.',
    image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800',
    rating: 4.9,
    reviewCount: 1870,
    avgCost: 120000,
    bestSeason: 'June - September (hiking), December - March (skiing)',
    highlights: ['Matterhorn', 'Jungfrau Region', 'Lake Geneva', 'Interlaken Paragliding', 'Glacier Express'],
    category: 'mountain',
    lat: 46.5597,
    lng: 7.4544,
  },
  {
    id: 'goa',
    name: 'Goa',
    country: 'India',
    tagline: 'Beach Paradise',
    description: 'Sun-kissed beaches, vibrant nightlife, Portuguese heritage, and spicy seafood. India\'s ultimate beach destination.',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800',
    rating: 4.5,
    reviewCount: 4200,
    avgCost: 35000,
    bestSeason: 'October - March',
    highlights: ['Baga Beach', 'Basilica of Bom Jesus', 'Anjuna Flea Market', 'Dudhsagar Falls', 'Spice Plantations'],
    category: 'beach',
    lat: 15.2993,
    lng: 74.124,
  },
  {
    id: 'santorini',
    name: 'Santorini',
    country: 'Greece',
    tagline: 'Aegean Jewel',
    description: 'Iconic white-washed buildings, stunning sunsets, volcanic beaches, and ancient history in the heart of the Aegean Sea.',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800',
    rating: 4.8,
    reviewCount: 1650,
    avgCost: 75000,
    bestSeason: 'May - October',
    highlights: ['Oia Sunset', 'Red Beach', 'Akrotiri Ruins', 'Wine Tasting', 'Caldera Boat Tour'],
    category: 'island',
    lat: 36.3932,
    lng: 25.4615,
  },
];

export const hotels: Hotel[] = [
  { id: 'h1', name: 'Bali Zen Resort', destinationId: 'bali', stars: 5, pricePerNight: 12000, rating: 4.9, reviewCount: 456, amenities: ['Pool', 'Spa', 'Free WiFi', 'Restaurant', 'Beach Access'], description: 'Luxury resort nestled in Ubud with infinity pool overlooking rice terraces.', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600', available: true },
  { id: 'h2', name: 'Beachside Villa Bali', destinationId: 'bali', stars: 4, pricePerNight: 7500, rating: 4.7, reviewCount: 234, amenities: ['Pool', 'Free WiFi', 'Kitchen', 'AC'], description: 'Cozy private villa steps from Seminyak Beach.', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600', available: true },
  { id: 'h3', name: 'Le Grand Paris', destinationId: 'paris', stars: 5, pricePerNight: 25000, rating: 4.8, reviewCount: 678, amenities: ['Spa', 'Restaurant', 'Free WiFi', 'Concierge', 'Gym'], description: 'Iconic luxury hotel near the Champs-Élysées with Michelin dining.', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600', available: true },
  { id: 'h4', name: 'Montmartre Boutique', destinationId: 'paris', stars: 3, pricePerNight: 9000, rating: 4.5, reviewCount: 345, amenities: ['Free WiFi', 'Breakfast', 'AC'], description: 'Charming boutique hotel in the heart of artistic Montmartre.', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600', available: true },
  { id: 'h5', name: 'Sakura Tower Tokyo', destinationId: 'tokyo', stars: 5, pricePerNight: 20000, rating: 4.9, reviewCount: 567, amenities: ['Spa', 'Restaurant', 'Free WiFi', 'Onsen', 'City View'], description: 'Ultra-modern tower in Shinjuku with panoramic city views and traditional onsen.', image: 'https://images.unsplash.com/photo-1590490360182-c33d955e28e0?w=600', available: true },
  { id: 'h6', name: 'Alpine Chalet Swiss', destinationId: 'swiss-alps', stars: 4, pricePerNight: 18000, rating: 4.8, reviewCount: 234, amenities: ['Fireplace', 'Ski-in/Ski-out', 'Free WiFi', 'Restaurant'], description: 'Traditional Swiss chalet with direct slope access and mountain views.', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600', available: true },
  { id: 'h7', name: 'Goa Beach Hut', destinationId: 'goa', stars: 3, pricePerNight: 3500, rating: 4.3, reviewCount: 890, amenities: ['Beach Access', 'Free WiFi', 'Restaurant', 'Bar'], description: 'Rustic beach hut with direct access to Calangute Beach.', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600', available: true },
  { id: 'h8', name: 'Santorini Cliff Resort', destinationId: 'santorini', stars: 5, pricePerNight: 22000, rating: 4.9, reviewCount: 345, amenities: ['Infinity Pool', 'Spa', 'Restaurant', 'Sunset View', 'Free WiFi'], description: 'Perched on the caldera cliffs with the most stunning sunset views.', image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600', available: true },
];

export const tripPlans: TripPlan[] = [
  {
    id: 'tp1', name: 'Bali Bliss 5D/4N', destinationId: 'bali', days: 5, price: 45000, category: 'standard',
    description: 'Perfect mix of culture, beaches, and adventure in 5 unforgettable days.',
    itinerary: [
      { day: 1, title: 'Arrival & Ubud', activities: ['Airport pickup', 'Check-in to hotel', 'Ubud Monkey Forest', 'Ubud Art Market'], meals: ['Dinner'], accommodation: 'Bali Zen Resort' },
      { day: 2, title: 'Temples & Rice Terraces', activities: ['Tegallalang Rice Terraces', 'Tirta Empul Temple', 'Coffee plantation visit'], meals: ['Breakfast', 'Lunch'], accommodation: 'Bali Zen Resort' },
      { day: 3, title: 'Adventure Day', activities: ['Mount Batur sunrise trek', 'Hot springs', 'Ubud cooking class'], meals: ['Breakfast', 'Dinner'], accommodation: 'Bali Zen Resort' },
      { day: 4, title: 'Beach & Culture', activities: ['Seminyak Beach', 'Tanah Lot Temple sunset', 'Kecak Dance performance'], meals: ['Breakfast', 'Lunch'], accommodation: 'Beachside Villa Bali' },
      { day: 5, title: 'Departure', activities: ['Last-minute shopping', 'Spa session', 'Airport transfer'], meals: ['Breakfast'], accommodation: '' },
    ],
    included: ['Airport transfers', 'Hotel stays', 'Daily breakfast', 'Guided tours', 'Entrance fees'],
  },
  {
    id: 'tp2', name: 'Paris Romance 4D/3N', destinationId: 'paris', days: 4, price: 65000, category: 'premium',
    description: 'A romantic Parisian escape covering all iconic landmarks and hidden gems.',
    itinerary: [
      { day: 1, title: 'Welcome to Paris', activities: ['Airport pickup', 'Seine River Cruise', 'Eiffel Tower at night'], meals: ['Dinner'], accommodation: 'Le Grand Paris' },
      { day: 2, title: 'Art & Culture', activities: ['Louvre Museum', 'Tuileries Garden', 'Champs-Élysées walk', 'Arc de Triomphe'], meals: ['Breakfast', 'Lunch'], accommodation: 'Le Grand Paris' },
      { day: 3, title: 'Montmartre & Versailles', activities: ['Montmartre & Sacré-Cœur', 'Versailles Palace afternoon'], meals: ['Breakfast', 'Dinner'], accommodation: 'Le Grand Paris' },
      { day: 4, title: 'Au Revoir', activities: ['Le Marais district', 'Macaron tasting', 'Airport transfer'], meals: ['Breakfast'], accommodation: '' },
    ],
    included: ['Airport transfers', '4-star hotel', 'Museum passes', 'River cruise', 'Guided walks'],
  },
  {
    id: 'tp3', name: 'Tokyo Explorer 6D/5N', destinationId: 'tokyo', days: 6, price: 78000, category: 'standard',
    description: 'Experience the perfect blend of ancient traditions and futuristic innovation.',
    itinerary: [
      { day: 1, title: 'Arrival in Tokyo', activities: ['Narita airport pickup', 'Shibuya Crossing', 'Shibuya Sky observation'], meals: ['Dinner'], accommodation: 'Sakura Tower Tokyo' },
      { day: 2, title: 'Traditional Tokyo', activities: ['Senso-ji Temple', 'Akihabara Electric Town', 'Tokyo Skytree'], meals: ['Breakfast', 'Lunch'], accommodation: 'Sakura Tower Tokyo' },
      { day: 3, title: 'Day Trip to Mt. Fuji', activities: ['Mount Fuji 5th station', 'Lake Kawaguchi', 'Onsen experience'], meals: ['Breakfast', 'Dinner'], accommodation: 'Sakura Tower Tokyo' },
      { day: 4, title: 'Food & Pop Culture', activities: ['Tsukiji Fish Market', 'Harajuku', 'Meiji Shrine', 'Robot Restaurant'], meals: ['Breakfast', 'Lunch', 'Dinner'], accommodation: 'Sakura Tower Tokyo' },
      { day: 5, title: 'TeamLab & Shopping', activities: ['teamLab Borderless', 'Ginza shopping', 'Omakase dinner'], meals: ['Breakfast', 'Dinner'], accommodation: 'Sakura Tower Tokyo' },
      { day: 6, title: 'Sayonara', activities: ['Morning tea ceremony', 'Narita airport transfer'], meals: ['Breakfast'], accommodation: '' },
    ],
    included: ['Airport transfers', 'JR Pass (3-day)', 'Hotel', 'Guided tours', 'Mt. Fuji trip'],
  },
  {
    id: 'tp4', name: 'Goa Getaway 3D/2N', destinationId: 'goa', days: 3, price: 18000, category: 'budget',
    description: 'Quick beach escape with nightlife, history, and relaxation.',
    itinerary: [
      { day: 1, title: 'Beach Vibes', activities: ['Airport pickup', 'Calangute Beach', 'Baga Night Market'], meals: ['Lunch', 'Dinner'], accommodation: 'Goa Beach Hut' },
      { day: 2, title: 'Heritage & Nature', activities: ['Old Goa Churches', 'Dudhsagar Falls', 'Spice Plantation tour'], meals: ['Breakfast', 'Lunch'], accommodation: 'Goa Beach Hut' },
      { day: 3, title: 'Last Waves', activities: ['Morning beach yoga', 'Anjuna Flea Market', 'Airport transfer'], meals: ['Breakfast'], accommodation: '' },
    ],
    included: ['Airport transfers', 'Beach hut stay', 'All meals', 'Sightseeing'],
  },
];

export const costEstimates = [
  { destination: 'Bali', budget: 45000, standard: 75000, premium: 120000, luxury: 200000 },
  { destination: 'Paris', budget: 65000, standard: 100000, premium: 150000, luxury: 300000 },
  { destination: 'Tokyo', budget: 70000, standard: 110000, premium: 180000, luxury: 350000 },
  { destination: 'Swiss Alps', budget: 90000, standard: 140000, premium: 220000, luxury: 400000 },
  { destination: 'Goa', budget: 18000, standard: 35000, premium: 60000, luxury: 120000 },
  { destination: 'Santorini', budget: 55000, standard: 90000, premium: 150000, luxury: 280000 },
];
