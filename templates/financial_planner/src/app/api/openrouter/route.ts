import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API = 'https://openrouter.ai/api/v1/chat/completions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, model = 'openai/gpt-4o-mini', apiKey: userKey } = body;

    const apiKey = process.env.OPENROUTER_API_KEY || userKey;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'No OpenRouter API key configured. Set OPENROUTER_API_KEY in environment or provide one in Settings.' },
        { status: 401 }
      );
    }

    const res = await fetch(OPENROUTER_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://financial-planner.app',
        'X-Title': 'Financial Planner AI',
      },
      body: JSON.stringify({
        model,
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: `OpenRouter API error: ${res.status} - ${errorText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({ content });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Proxy error: ${error.message}` },
      { status: 500 }
    );
  }
}