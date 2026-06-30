import { uploadBuffer } from './storage';

// Free TTS using OpenRouter free models for text processing
// Then use browser Web Speech API or free TTS services

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Free TTS alternatives:
// 1. Browser Web Speech API (client-side only)
// 2. Free TTS APIs with limitations
// 3. Generate SSML for future use

export async function generateVoiceover(
  text: string,
  voiceId?: string
): Promise<string> {
  // For free tier, we generate a text file with the script
  // In production, integrate with ElevenLabs or use Web Speech API

  const scriptContent = `# Voiceover Script

## Instructions
- Read this script at a natural pace (~130 words/minute)
- Use emphasis on key points
- Pause briefly between sections

---

${text}

---

## Metadata
- Generated: ${new Date().toISOString()}
- Word Count: ${text.split(/\s+/).length}
- Estimated Duration: ${Math.round(text.split(/\s+/).length / 130)} minutes
`;

  const buffer = Buffer.from(scriptContent, 'utf-8');
  const url = await uploadBuffer(buffer, `voiceover-script-${Date.now()}.md`, 'text/markdown');

  return url;
}

// Alternative: Generate SSML for TTS engines
export function generateSSML(text: string): string {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());

  let ssml = '<speak>';
  sentences.forEach((sentence, i) => {
    ssml += `<p>${sentence.trim()}.</p>`;
    if (i < sentences.length - 1) {
      ssml += '<break time="500ms"/>';
    }
  });
  ssml += '</speak>';

  return ssml;
}

// Get available free TTS options
export function getFreeTTSOptions(): { name: string; description: string }[] {
  return [
    { name: 'Web Speech API', description: 'Browser-based TTS (client-side only)' },
    { name: 'OpenRouter Script', description: 'Generate script file for manual recording' },
    { name: 'SSML Export', description: 'Export as SSML for any TTS engine' },
  ];
}
