import { uploadBuffer } from './storage';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';

export async function generateVoiceover(
  text: string,
  voiceId?: string
): Promise<string> {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ELEVENLABS_API_KEY not configured');
  }

  const usedVoiceId = voiceId || DEFAULT_VOICE_ID;

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${usedVoiceId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.5,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error: ${error}`);
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  const audioUrl = await uploadBuffer(audioBuffer, `voiceover-${Date.now()}.mp3`, 'audio/mpeg');

  return audioUrl;
}

export async function getVoices(): Promise<{ voiceId: string; name: string }[]> {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ELEVENLABS_API_KEY not configured');
  }

  const response = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch voices');
  }

  const data = await response.json();
  return data.voices.map((v: { voice_id: string; name: string }) => ({
    voiceId: v.voice_id,
    name: v.name,
  }));
}
