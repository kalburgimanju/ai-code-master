export interface VideoIdea {
  id: string;
  title: string;
  niche: string;
  estimatedViews: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
}

export interface Script {
  id: string;
  title: string;
  niche: string;
  duration: string;
  hook: string;
  sections: { heading: string; content: string }[];
  cta: string;
}

export interface Keyword {
  id: string;
  keyword: string;
  searchVolume: string;
  competition: 'Low' | 'Medium' | 'High';
  score: number;
}

export interface Channel {
  id: string;
  name: string;
  subscribers: string;
  views: string;
  videos: number;
  revenue: string;
}

export const videoIdeas: VideoIdea[] = [
  { id: '1', title: '10 AI Tools That Will Make You $10K/Month in 2026', niche: 'Tech & AI', estimatedViews: '150K-500K', difficulty: 'Easy', tags: ['AI', 'passive income', 'side hustle'] },
  { id: '2', title: 'Dark Psychology Tricks That Actually Work', niche: 'Psychology', estimatedViews: '200K-1M', difficulty: 'Medium', tags: ['psychology', 'manipulation', 'body language'] },
  { id: '3', title: 'Why Most People Die With Regret (And How to Avoid It)', niche: 'Motivation', estimatedViews: '300K-2M', difficulty: 'Easy', tags: ['motivation', 'regret', 'life advice'] },
  { id: '4', title: 'The Dark Side of Social Media Nobody Talks About', niche: 'Society', estimatedViews: '100K-400K', difficulty: 'Medium', tags: ['social media', 'mental health', 'society'] },
  { id: '5', title: '5 Passive Income Ideas for Introverts in 2026', niche: 'Finance', estimatedViews: '250K-800K', difficulty: 'Easy', tags: ['passive income', 'introvert', 'money'] },
  { id: '6', title: 'How Japan Solves Problems Nobody Else Can', niche: 'Culture', estimatedViews: '100K-500K', difficulty: 'Hard', tags: ['Japan', 'innovation', 'culture'] },
  { id: '7', title: 'Scary Facts That Sound Fake But Are 100% True', niche: 'Entertainment', estimatedViews: '500K-3M', difficulty: 'Easy', tags: ['facts', 'scary', 'mystery'] },
  { id: '8', title: 'Why Successful People Wake Up at 5 AM', niche: 'Productivity', estimatedViews: '150K-600K', difficulty: 'Easy', tags: ['productivity', 'morning routine', 'success'] },
];

export const scripts: Script[] = [
  {
    id: '1',
    title: '10 AI Tools That Will Make You $10K/Month',
    niche: 'Tech & AI',
    duration: '12:30',
    hook: 'What if I told you there are AI tools sitting right now that can make you $10,000 a month — and nobody is using them?',
    sections: [
      { heading: 'Tool #1: ChatGPT for Content Creation', content: 'ChatGPT has evolved beyond simple text generation. You can use it to create entire content businesses, from blog posts to social media campaigns, all without showing your face.' },
      { heading: 'Tool #2: Midjourney for Design', content: 'Midjourney generates stunning visuals that you can sell as prints, use in client work, or monetize through stock photography platforms.' },
      { heading: 'Tool #3: Runway for Video Editing', content: 'Runway ML lets you edit videos with AI, removing the need for expensive software or technical skills.' },
      { heading: 'Tool #4-10: The Complete Stack', content: 'From copywriting to automation, these tools work together to create passive income streams that run while you sleep.' },
    ],
    cta: 'If this opened your eyes to new possibilities, smash that subscribe button. New AI money-making strategies drop every week.',
  },
  {
    id: '2',
    title: 'Dark Psychology Tricks That Actually Work',
    niche: 'Psychology',
    duration: '10:15',
    hook: 'Want to know the secret weapon that manipulators, cult leaders, and top salespeople all use? It is called the reciprocity loop — and once you see it, you will never unsee it.',
    sections: [
      { heading: 'The Reciprocity Loop', content: 'When someone does something for you, your brain feels compelled to return the favor. This is hardwired into human psychology and is used everywhere from free samples to dating.' },
      { heading: 'Anchoring Bias', content: 'The first number someone hears sets the frame for everything after. This is why stores show the original price before the sale price — your brain anchors to the higher number.' },
      { heading: 'Social Proof in Action', content: 'We look to others to determine what is correct. This is why fake reviews, fake scarcity, and fake testimonials work so well — even when we know they might be fake.' },
    ],
    cta: 'Now that you know these tricks, you will start seeing them everywhere. Drop a comment telling me which one surprised you most.',
  },
];

export const keywords: Keyword[] = [
  { id: '1', keyword: 'ai side hustle 2026', searchVolume: '18K', competition: 'Low', score: 92 },
  { id: '2', keyword: 'passive income ideas', searchVolume: '45K', competition: 'High', score: 65 },
  { id: '3', keyword: 'dark psychology tricks', searchVolume: '27K', competition: 'Medium', score: 78 },
  { id: '4', keyword: 'faceless youtube channel', searchVolume: '12K', competition: 'Low', score: 95 },
  { id: '5', keyword: 'make money online 2026', searchVolume: '33K', competition: 'High', score: 58 },
  { id: '6', keyword: 'scary facts that sound fake', searchVolume: '21K', competition: 'Medium', score: 82 },
  { id: '7', keyword: 'morning routine for success', searchVolume: '15K', competition: 'Low', score: 88 },
  { id: '8', keyword: 'productivity hacks', searchVolume: '38K', competition: 'Medium', score: 71 },
];

export const channels: Channel[] = [
  { id: '1', name: 'Mind Maze', subscribers: '1.2M', views: '89M', videos: 156, revenue: '$4,200' },
  { id: '2', name: 'Tech Uncovered', subscribers: '680K', views: '45M', videos: 98, revenue: '$2,800' },
  { id: '3', name: 'Dark Truths', subscribers: '2.1M', views: '142M', videos: 203, revenue: '$7,500' },
  { id: '4', name: 'Finance Simplified', subscribers: '420K', views: '28M', videos: 67, revenue: '$1,900' },
];
