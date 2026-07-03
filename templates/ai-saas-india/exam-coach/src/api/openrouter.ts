const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface StudyPlanRequest {
  language: string;
  subject: string;
  hoursPerDay?: number;
}

export interface StudyPlanResponse {
  dailySchedule: DailySchedule[];
  mcqPractice: MCQQuestion[];
  studyTips: string[];
}

export interface DailySchedule {
  time: string;
  activity: string;
  duration: string;
  description: string;
}

export interface MCQQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

function getApiKey(): string | null {
  try {
    return import.meta.env.VITE_OPENROUTER_API_KEY || null;
  } catch {
    return null;
  }
}

function getDemoResponse(request: StudyPlanRequest): StudyPlanResponse {
  const subjectName = request.subject.charAt(0).toUpperCase() + request.subject.slice(1);

  return {
    dailySchedule: [
      {
        time: '06:00 AM',
        activity: `Revision - ${subjectName}`,
        duration: '1 hour',
        description: `Review previous day's ${subjectName} notes and key concepts.`,
      },
      {
        time: '07:30 AM',
        activity: `New Topic - ${subjectName}`,
        duration: '2 hours',
        description: `Study new topics in ${subjectName} with focus areas.`,
      },
      {
        time: '10:00 AM',
        activity: 'MCQ Practice',
        duration: '1 hour',
        description: 'Practice 30 multiple-choice questions on current topics.',
      },
      {
        time: '02:00 PM',
        activity: 'Current Affairs',
        duration: '45 minutes',
        description: 'Read and analyze daily current affairs relevant to UPSC/SSC.',
      },
      {
        time: '04:00 PM',
        activity: `Mock Test - ${subjectName}`,
        duration: '1.5 hours',
        description: `Take a timed mock test on ${subjectName} topics.`,
      },
      {
        time: '07:00 PM',
        activity: 'Doubt Resolution',
        duration: '1 hour',
        description: 'Review and clarify doubts from the day\'s study.',
      },
    ],
    mcqPractice: [
      {
        question: `Which of the following is a fundamental duty in the Constitution of India?`,
        options: [
          'Right to equality',
          'To develop scientific temper',
          'Right to property',
          'Right to freedom of religion',
        ],
        correctAnswer: 1,
        explanation:
          'Article 51A(h) mentions the fundamental duty to develop scientific temper, humanism, and the spirit of inquiry and reform.',
      },
      {
        question: `What is the minimum age for becoming a member of the Rajya Sabha?`,
        options: ['25 years', '30 years', '35 years', '21 years'],
        correctAnswer: 1,
        explanation:
          'According to Article 84 of the Indian Constitution, a person must be at least 30 years of age to become a member of the Rajya Sabha.',
      },
      {
        question: `Which Article of the Indian Constitution deals with the Right to Equality?`,
        options: ['Article 12', 'Article 14', 'Article 19', 'Article 21'],
        correctAnswer: 1,
        explanation:
          'Article 14 guarantees equality before law and equal protection of laws within the territory of India.',
      },
    ],
    studyTips: [
      'Read the newspaper daily for at least 30 minutes to stay updated on current affairs.',
      'Make concise notes for quick revision, especially for last-minute preparation.',
      'Practice previous year question papers to understand the exam pattern.',
      'Focus on understanding concepts rather than rote memorization.',
      'Take regular breaks using the Pomodoro technique (25 min study, 5 min break).',
      'Join online discussion groups for doubt clearing and peer learning.',
    ],
  };
}

export async function generateStudyPlan(request: StudyPlanRequest): Promise<StudyPlanResponse> {
  const apiKey = getApiKey();

  if (!apiKey) {
    return getDemoResponse(request);
  }

  const prompt = `You are an expert UPSC/SSC exam coach. Generate a personalized study plan in ${request.language} language for the subject "${request.subject}".

Please provide:
1. A detailed daily schedule with 6 time slots (including revision, new topics, MCQ practice, current affairs, mock tests, and doubt resolution)
2. 3 practice MCQ questions with 4 options each, correct answer index, and explanation
3. 6 study tips for the student

Respond in JSON format with this exact structure:
{
  "dailySchedule": [
    {
      "time": "06:00 AM",
      "activity": "Activity Name",
      "duration": "1 hour",
      "description": "Description of the activity"
    }
  ],
  "mcqPractice": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation text"
    }
  ],
  "studyTips": ["Tip 1", "Tip 2"]
}

Make sure all text is in ${request.language} language. Focus on UPSC/SSC syllabus.`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Vernacular Exam Coach',
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-3-ultra-550b-a55b:free',
        messages: [
          {
            role: 'system',
            content: 'You are an expert Indian competitive exam coach. Always respond in valid JSON format.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in response');
    }

    // Try to parse JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON in response');
    }

    const parsed = JSON.parse(jsonMatch[0]) as StudyPlanResponse;

    // Validate the structure
    if (!parsed.dailySchedule || !parsed.mcqPractice || !parsed.studyTips) {
      throw new Error('Invalid response structure');
    }

    return parsed;
  } catch (error) {
    console.error('API call failed, falling back to demo:', error);
    return getDemoResponse(request);
  }
}
