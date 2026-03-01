import { NextRequest, NextResponse } from 'next/server';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, context, apiKey: clientApiKey } = await request.json();

    // API Key: クライアントから送られたもの > サーバーの環境変数
    const apiKey = clientApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Keyが設定されていません' },
        { status: 400 }
      );
    }

    const model = 'gemini-3.1-pro-preview';

    // Gemini APIのフォーマットに変換
    const contents = messages.map((msg: ChatMessage) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // コンテキストがある場合は最初に追加
    if (context) {
      contents.unshift({
        role: 'user',
        parts: [
          {
            text: `以下は学習資料の内容です:\n\n${context}\n\n上記の内容を参考に質問に答えてください。`,
          },
        ],
      });
      contents.splice(1, 0, {
        role: 'model',
        parts: [{ text: '了解しました。学習資料の内容を理解しました。質問をどうぞ。' }],
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `Gemini API error: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      return NextResponse.json(
        { error: 'Invalid response from Gemini API' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      response: data.candidates[0].content.parts[0].text,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
