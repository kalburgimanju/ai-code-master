import type { CityData } from './types';

export const CITIES: CityData[] = [
  {
    name: 'Bangalore',
    state: 'Karnataka',
    trafficPeakHours: '8:00-10:30 AM, 5:30-8:30 PM',
    commonFestival: 'Kaveri Trayodashi, Bangalore Karaga',
    avgRainfall: '970mm (Jun-Sep monsoon)',
  },
  {
    name: 'Mumbai',
    state: 'Maharashtra',
    trafficPeakHours: '8:00-11:00 AM, 5:00-9:00 PM',
    commonFestival: 'Ganesh Chaturthi, Navratri',
    avgRainfall: '2200mm (Jun-Sep heavy monsoon)',
  },
  {
    name: 'Delhi',
    state: 'NCR',
    trafficPeakHours: '8:30-10:30 AM, 5:00-8:00 PM',
    commonFestival: 'Diwali, Dussehra, Republic Day',
    avgRainfall: '800mm (Jul-Aug monsoon)',
  },
  {
    name: 'Chennai',
    state: 'Tamil Nadu',
    trafficPeakHours: '8:00-10:00 AM, 5:00-8:00 PM',
    commonFestival: 'Pongal, Chennai Margazhi',
    avgRainfall: '1400mm (Oct-Dec NE monsoon)',
  },
  {
    name: 'Hyderabad',
    state: 'Telangana',
    trafficPeakHours: '9:00-11:00 AM, 5:30-8:30 PM',
    commonFestival: 'Bathukamma, Bonalu, Eid',
    avgRainfall: '810mm (Jul-Sep monsoon)',
  },
];

export const SAMPLE_ADDRESSES: Record<string, string[]> = {
  Bangalore: [
    'Koramangala 5th Block, Bangalore',
    'Indiranagar 12th Main, Bangalore',
    'HSR Layout Sector 2, Bangalore',
    'Whitefield Main Road, Bangalore',
    'Electronic City Phase 1, Bangalore',
    'Jayanagar 4th Block, Bangalore',
    'Malleshwaram 8th Cross, Bangalore',
    'BTM Layout 2nd Stage, Bangalore',
  ],
  Mumbai: [
    'Bandra West, Linking Road, Mumbai',
    'Andheri East, MIDC, Mumbai',
    'Lower Parel, Senapati Bapat Marg, Mumbai',
    'Powai Lake Road, Mumbai',
    'Thane West, Ghodbunder Road, Mumbai',
    'Navi Mumbai, Vashi Sector 17, Mumbai',
    'Dadar TT Circle, Mumbai',
    'Juhu Lane, Andheri West, Mumbai',
  ],
  Delhi: [
    'Connaught Place, New Delhi',
    'Hauz Khas Village, New Delhi',
    'Cyber Hub, Gurugram',
    'Noida Sector 62, UP',
    'Lajpat Nagar, New Delhi',
    'Dwarka Sector 21, New Delhi',
    'Rohini Sector 3, New Delhi',
    'Karol Bagh, New Delhi',
  ],
  Chennai: [
    'T. Nagar, Pondy Bazaar, Chennai',
    'Adyar, LB Road, Chennai',
    'OMR, Thoraipakkam, Chennai',
    'Anna Nagar West, Chennai',
    'Velachery Main Road, Chennai',
    'Sholinganallur, Chennai',
    'Mylapore, Luz Corner, Chennai',
    'Porur, Chennai',
  ],
  Hyderabad: [
    'HITEC City, Madhapur, Hyderabad',
    'Banjara Hills Road No. 10, Hyderabad',
    'Jubilee Hills, Hyderabad',
    'Gachibowli, Hyderabad',
    'Kondapur, Hyderabad',
    'Secunderabad, MG Road, Hyderabad',
    'Ameerpet, Hyderabad',
    'Kukatpally, Hyderabad',
  ],
};

export const TIME_OPTIONS = [
  { value: 'morning-rush', label: 'Morning Rush (7-10 AM)', icon: '🌅' },
  { value: 'midday', label: 'Midday (10 AM-2 PM)', icon: '☀️' },
  { value: 'afternoon', label: 'Afternoon (2-5 PM)', icon: '🌤️' },
  { value: 'evening-rush', label: 'Evening Rush (5-9 PM)', icon: '🌆' },
  { value: 'night', label: 'Night (9 PM-12 AM)', icon: '🌙' },
];
