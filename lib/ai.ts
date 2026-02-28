export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * サーバーサイドAPI経由でGemini APIを呼び出し
 * API Keyはサーバーサイドで管理され、クライアントに公開されません
 */
export async function getGeminiResponse(
  apiKey: string | undefined,
  messages: ChatMessage[],
  context?: string
): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      context,
      apiKey, // 設定画面で登録したAPI Keyがある場合のみ送信
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'AI APIエラー');
  }

  const data = await response.json();
  return data.response;
}
