import type { GradeCurriculum, Lesson, Resource, Reference } from './types';

// References for Sanskrit lessons
export const references: Record<string, Reference[]> = {
  'basic-greetings': [
    { id: 'ref1', title: 'Devavāṇipraveśaḥ (Introduction to Sanskrit)', author: 'Monier-Williams', edition: '5th Edition', page: 45 },
    { id: 'ref2', title: 'Sanskrit Grammar', author: 'William Dwyer', page: 120 },
  ],
  'numbers': [
    { id: 'ref3', title: 'Sanskrit Dictionary', author: 'Monier-Williams', page: 342 },
    { id: 'ref4', title: 'Learn Sanskrit in 30 Days', author: 'Ramesh Chandra', page: 78 },
  ],
  'family-terms': [
    { id: 'ref5', title: 'Sanskrit Vyakarana', author: 'Patanjali', edition: 'Sanskrit Edition', page: 201 },
    { id: 'ref6', title: 'Basic Sanskrit', author: 'Lalita vyavhar', page: 156 },
  ],
  'basic-verbs': [
    { id: 'ref7', title: 'Devavāṇipraveśaḥ', author: 'Monier-Williams', page: 234 },
    { id: 'ref8', title: 'Sanskrit for Beginners', author: 'Swami Dayananda', page: 89 },
  ],
};

// Resources for each grade
export const gradeResources: Record<number, Resource[]> = {
  1: [
    { id: 'r1', type: 'book', title: 'Devavāṇipraveśaḥ - Introduction to Sanskrit', url: '/books/devavani-pravesha.pdf', description: 'Basic introduction to Sanskrit language' },
    { id: 'r2', type: 'audio', title: 'Basic Greetings in Sanskrit', url: '/audio/greetings.mp3', duration: '3:45' },
    { id: 'r3', type: 'video', title: 'Learn Sanskrit Alphabet', url: '/videos/alphabet.mp4', duration: '12:30' },
  ],
  2: [
    { id: 'r4', type: 'book', title: 'Learn Sanskrit in 30 Days', url: '/books/30-days-sanskrit.pdf', description: 'Day-by-day learning guide' },
    { id: 'r5', type: 'audio', title: 'Numbers 1-100', url: '/audio/numbers.mp3', duration: '8:20' },
    { id: 'r6', type: 'learning-video', title: 'Family Relations', url: '/videos/family.mp4', duration: '15:45' },
  ],
  3: [
    { id: 'r7', type: 'book', title: 'Sanskrit Grammar for Beginners', url: '/books/sanskrit-grammar.pdf', description: 'Basic grammar rules' },
    { id: 'r8', type: 'video', title: 'Basic Verbs in Sanskrit', url: '/videos/verbs.mp4', duration: '18:30' },
  ],
  4: [
    { id: 'r9', type: 'book', title: 'Devavāṇipraveśaḥ', url: '/books/devavani-pravesha.pdf', description: 'Intermediate Sanskrit' },
    { id: 'r10', type: 'audio', title: 'Practice Sentences', url: '/audio/sentences.mp3', duration: '12:00' },
  ],
  5: [
    { id: 'r11', type: 'book', title: 'Sanskrit for Schools', url: '/books/sanskrit-schools.pdf', description: 'School-level Sanskrit' },
    { id: 'r12', type: 'learning-video', title: 'Conjugation Basics', url: '/videos/conjugation.mp4', duration: '22:15' },
  ],
  6: [
    { id: 'r13', type: 'book', title: 'Advanced Sanskrit Grammar', url: '/books/advanced-grammar.pdf', description: 'Compound words and formations' },
    { id: 'r14', type: 'video', title: 'Pronunciation Guide', url: '/videos/pronunciation.mp4', duration: '25:00' },
  ],
  7: [
    { id: 'r15', type: 'book', title: 'Sanskrit Literature Reader', url: '/books/literature-reader.pdf', description: 'Classical texts' },
    { id: 'r16', type: 'audio', title: 'Classical Poetry Recitation', url: '/audio/poetry.mp3', duration: '15:30' },
  ],
  8: [
    { id: 'r17', type: 'book', title: 'Mahabharata Simplified', url: '/books/mahabharata.pdf', description: 'Adapted for learners' },
    { id: 'r18', type: 'learning-video', title: 'Mahabharata Stories', url: '/videos/mahabharata.mp4', duration: '45:00' },
  ],
  9: [
    { id: 'r19', type: 'book', title: 'Ramayana for Students', url: '/books/ramayana.pdf', description: 'Valmiki Ramayana adapted' },
    { id: 'r20', type: 'video', title: 'Ramayana Episodes', url: '/videos/ramayana.mp4', duration: '60:00' },
  ],
  10: [
    { id: 'r21', type: 'book', title: 'Classical Sanskrit Texts', url: '/books/classical-texts.pdf', description: 'Bhagavad Gita and Upanishads' },
    { id: 'r22', type: 'audio', title: 'Bhagavad Gita Chanting', url: '/audio/gita-chanting.mp3', duration: '30:00' },
  ],
};

// Complete curriculum for grades 1-10
export const gradeCurriculum: GradeCurriculum[] = [
  {
    grade: 1,
    title: 'आरंभिक संस्कृतम् (Beginning Sanskrit)',
    description: 'Introduction to Sanskrit alphabet, basic greetings, and numbers',
    lessons: [
      { id: 'greet-1', title: 'स्वागतम् (Greetings)', description: 'Learn basic greetings in Sanskrit', duration: '15 mins' },
      { id: 'num-1', title: 'संख्याः (Numbers)', description: 'Numbers 1-10 in Sanskrit', duration: '20 mins' },
      { id: 'family-1', title: 'परिवारम् (Family)', description: 'Family members and relationships', duration: '25 mins' },
    ],
    resources: gradeResources[1],
  },
  {
    grade: 2,
    title: 'आधारभूतम् (Fundamentals)',
    description: 'Basic verbs, simple sentences, and common vocabulary',
    lessons: [
      { id: 'verb-2', title: 'क्रियापदानि (Basic Verbs)', description: 'Present tense conjugations', duration: '30 mins' },
      { id: 'sent-2', title: 'वाक्याः (Sentences)', description: 'Simple sentence construction', duration: '35 mins' },
      { id: 'vocab-2', title: 'शब्दाः (Vocabulary)', description: 'Common words and their meanings', duration: '25 mins' },
    ],
    resources: gradeResources[2],
  },
  {
    grade: 3,
    title: 'व्याकरणमूलम् (Grammar Foundation)',
    description: 'Introduction to Sanskrit grammar rules and structure',
    lessons: [
      { id: 'case-3', title: 'विभक्तिः (Cases)', description: 'Nominative, accusative, and instrumental cases', duration: '40 mins' },
      { id: 'gender-3', title: 'लिङ्गम् (Gender)', description: 'Masculine, feminine, neuter', duration: '30 mins' },
      { id: 'number-3', title: 'वचनम् (Number)', description: 'Singular, dual, plural forms', duration: '35 mins' },
    ],
    resources: gradeResources[3],
  },
  {
    grade: 4,
    title: 'उन्नतिः (Progress)',
    description: 'Building complex sentences and expanding vocabulary',
    lessons: [
      { id: 'compound-4', title: 'समासाः (Compound Words)', description: 'Types of compounds in Sanskrit', duration: '45 mins' },
      { id: 'prep-4', title: 'क्रियाप्रयोगाः (Verbs)', description: 'Past and future tenses', duration: '50 mins' },
      { id: 'dialogue-4', title: 'संवादम् (Dialogue)', description: 'Simple conversation practice', duration: '30 mins' },
    ],
    resources: gradeResources[4],
  },
  {
    grade: 5,
    title: 'मध्यस्तरीयम् (Intermediate)',
    description: 'Intermediate level with classical texts and prose',
    lessons: [
      { id: 'prose-5', title: 'आलेखम् (Prose)', description: 'Reading and translating prose', duration: '55 mins' },
      { id: 'poetry-5', title: 'काव्यम् (Poetry)', description: 'Basic poetry analysis', duration: '60 mins' },
      { id: 'composition-5', title: 'रचना (Composition)', description: 'Writing simple Sanskrit', duration: '45 mins' },
    ],
    resources: gradeResources[5],
  },
  {
    grade: 6,
    title: 'उन्नतम् (Advanced)',
    description: 'Advanced grammar, classical literature, and translation skills',
    lessons: [
      { id: ' Derivatives-6', title: 'ध्रुवपदानि (Derivatives)', description: 'Formation of derived words', duration: '65 mins' },
      { id: 'sandhi-6', title: 'संधिः (Sandhi)', description: 'Rules of phonetic combination', duration: '70 mins' },
      { id: 'translation-6', title: 'अनुवादः (Translation)', description: 'Translating from Sanskrit to English', duration: '60 mins' },
    ],
    resources: gradeResources[6],
  },
  {
    grade: 7,
    title: 'प्राचीन साहित्यम् (Ancient Literature)',
    description: 'Study of classical Sanskrit texts and literature',
    lessons: [
      { id: 'mahabharata-7', title: 'महाभारतम् (Mahabharata)', description: 'Selected episodes from Mahabharata', duration: '90 mins' },
      { id: 'ramayana-7', title: 'रामायणम् (Ramayana)', description: 'Valmiki Ramayana selections', duration: '90 mins' },
      { id: 'vedic-7', title: 'वेदाः (Vedas)', description: 'Introduction to Vedic texts', duration: '75 mins' },
    ],
    resources: gradeResources[7],
  },
  {
    grade: 8,
    title: 'महाकाव्याणि (Major Epics)',
    description: 'In-depth study of major Sanskrit epics',
    lessons: [
      { id: 'abhanga-8', title: 'अभिनयः (Dramatic Technique)', description: 'Study of dramatic elements', duration: '80 mins' },
      { id: 'alamkara-8', title: 'आलंकाराः (Figures of Speech)', description: 'Poetic figures and techniques', duration: '85 mins' },
      { id: 'kriti-8', title: 'कृतिः (Authorial Style)', description: 'Understanding author\'s style', duration: '70 mins' },
    ],
    resources: gradeResources[8],
  },
  {
    grade: 9,
    title: 'दर्शनयोगः (Philosophy and Yoga)',
    description: 'Philosophical texts and Yoga sutras',
    lessons: [
      { id: 'gita-9', title: 'भगवद्गीता (Bhagavad Gita)', description: 'Selected chapters from Gita', duration: '120 mins' },
      { id: 'yoga-9', title: 'योगशास्त्रम् (Yoga Sutras)', description: 'Introduction to Yoga philosophy', duration: '100 mins' },
      { id: 'upanishads-9', title: 'उपनिषदाः (Upanishads)', description: 'Key concepts from Upanishads', duration: '90 mins' },
    ],
    resources: gradeResources[9],
  },
  {
    grade: 10,
    title: 'वैदिकयोगः (Vedic Studies)',
    description: 'Advanced Vedic studies and research methods',
    lessons: [
      { id: 'rituals-10', title: 'चाक्षुषीकरणम् (Ritual Studies)', description: 'Vedic rituals and ceremonies', duration: '100 mins' },
      { id: 'linguistics-10', title: 'भाषाविज्ञानम् (Linguistics)', description: 'Sanskrit linguistic analysis', duration: '90 mins' },
      { id: 'research-10', title: 'अध्ययनम् (Research Methods)', description: 'Methods of Sanskrit research', duration: '80 mins' },
    ],
    resources: gradeResources[10],
  },
];

// Detailed lessons for practice
export const lessons: Lesson[] = [
  {
    id: 'greet-1',
    grade: 1,
    title: 'स्वागतम् (Greetings)',
    sanskritText: 'नमस्ते (Namaste) - I bow to you\nशुभास्ति (Shubhasti) - Are you well?\nकथम् अस्ति त्वम्? (Katham asti tvam?) - How are you?\nमया स्वागतम् (Mayā svāgatam) - Welcome\nअतिशयेन शुभाः (Atiśayena shubhāḥ) - Good morning/evening',
    englishTranslation: 'Greetings and basic phrases for daily communication',
    romanTranslation: 'Namaste - I bow to you\nShubhasti - Are you well?\nKatham asti tvam? - How are you?\nMayā svāgatam - Welcome\nAtiśayena shubhāḥ - Good morning/evening',
    explanation: 'Learn fundamental greetings used in daily interactions. These phrases form the foundation of Sanskrit communication.',
    resources: [
      { id: 'l1-res1', type: 'audio', title: 'Pronunciation Guide - Greetings', url: '/audio/greet-pronunciation.mp3', duration: '5:00' },
      { id: 'l1-res2', type: 'video', title: 'Practice with Native Speaker', url: '/videos/greet-practice.mp4', duration: '8:00' },
    ],
    references: references['basic-greetings'],
    practiceQuestions: [
      { id: 'p1', question: 'How do you say "Hello" in Sanskrit?', answer: 'नमस्ते (Namaste)' },
      { id: 'p2', question: 'What does "शुभास्ति" mean?', answer: 'Are you well?' },
    ],
  },
  {
    id: 'num-1',
    grade: 1,
    title: 'संख्याः (Numbers)',
    sanskritText: '१ (ekaṃ) - One\nद्वि (dvayaṃ) - Two\nत्रि (trayaṃ) - Three\nचतुर् (catur) - Four\nपञ्च (pañca) - Five\nषट् (ṣaṭ) - Six\nसप्त (sapta) - Seven\nअष्ट (aṣṭa) - Eight\nनव (nava) - Nine\nदश (daśa) - Ten',
    englishTranslation: 'Numbers 1 to 10 with their Sanskrit forms',
    romanTranslation: '1 (ekaṃ) - One\ndvayaṃ - Two\ntrayaṃ - Three\ncatur - Four\npañca - Five\nṣaṭ - Six\nsapta - Seven\naṣṭa - Eight\nnava - Nine\ndaśa - Ten',
    explanation: 'Learn numbers 1-10, essential for counting and basic mathematics in Sanskrit.',
    resources: [
      { id: 'l2-res1', type: 'audio', title: 'Count 1-10 in Sanskrit', url: '/audio/count-1-10.mp3', duration: '3:00' },
      { id: 'l2-res2', type: 'learning-video', title: 'Number Practice Video', url: '/videos/numbers-practice.mp4', duration: '10:00' },
    ],
    references: references['numbers'],
    practiceQuestions: [
      { id: 'p3', question: 'How do you say "Three" in Sanskrit?', answer: 'त्रि (trayaṃ) or त्रिम् (trim)' },
      { id: 'p4', question: 'What is "Five" in Sanskrit?', answer: 'पञ्च (pañca)' },
    ],
  },
];

// Helper functions
export const getCurriculumByGrade = (grade: number): GradeCurriculum | undefined => {
  return gradeCurriculum.find(g => g.grade === grade);
};

export const getLessonsByGrade = (grade: number): Lesson[] => {
  return lessons.filter(l => l.grade === grade);
};

export const getAllResources = (): Resource[] => {
  const allResources: Resource[] = [];
  Object.values(gradeResources).forEach(res => res.forEach(r => allResources.push(r)));
  return allResources;
};