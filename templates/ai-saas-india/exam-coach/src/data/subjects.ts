export interface Subject {
  id: string;
  name: string;
  icon: string;
  topics: string[];
}

export const subjects: Subject[] = [
  {
    id: 'polity',
    name: 'Polity',
    icon: 'Scale',
    topics: [
      'Constitution of India',
      'Fundamental Rights',
      'Directive Principles',
      'Parliament',
      'Judiciary',
      'State Governments',
      'Panchayati Raj',
      'Amendments',
    ],
  },
  {
    id: 'history',
    name: 'History',
    icon: 'BookOpen',
    topics: [
      'Ancient India',
      'Medieval India',
      'Modern India',
      'Indian National Movement',
      'World History',
      'Art & Culture',
    ],
  },
  {
    id: 'geography',
    name: 'Geography',
    icon: 'Globe',
    topics: [
      'Physical Geography',
      'Indian Geography',
      'World Geography',
      'Climate & Weather',
      'Resources',
      'Environmental Issues',
    ],
  },
  {
    id: 'economy',
    name: 'Economy',
    icon: 'TrendingUp',
    topics: [
      'Indian Economy',
      'Five Year Plans',
      'Banking & Finance',
      'Budget & Taxation',
      'International Trade',
      'Economic Reforms',
    ],
  },
  {
    id: 'science',
    name: 'Science',
    icon: 'FlaskConical',
    topics: [
      'Physics',
      'Chemistry',
      'Biology',
      'Space Science',
      'Computer Science',
      'Environmental Science',
    ],
  },
];
