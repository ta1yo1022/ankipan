export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Gemini APIを使用してチャット応答を取得
 */
export async function getGeminiResponse(
  apiKey: string,
  messages: ChatMessage[],
  context?: string
): Promise<string> {
  const model = 'gemini-3.1-pro-preview'; // 最新の賢いモデル

  // Gemini APIのフォーマットに変換
  const contents = messages.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  // コンテキストがある場合は最初に追加
  if (context) {
    contents.unshift({
      role: 'user',
      parts: [{ text: `以下は学習資料の内容です:\n\n${context}\n\n上記の内容を参考に質問に答えてください。` }],
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
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json();

  if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
    throw new Error('Invalid response from Gemini API');
  }

  return data.candidates[0].content.parts[0].text;
}
