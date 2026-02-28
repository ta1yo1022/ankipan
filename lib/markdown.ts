import matter from 'gray-matter';

export interface MarkdownFile {
  id: string;
  title: string;
  subject: string;
  content: string;
  lastStudied?: string;
}

export interface AnswerToken {
  type: 'answer';
  text: string;
}

/**
 * {{...}} 記法をパースして AnswerToken と文字列の配列に変換
 * 例: "徳川家康は{{1603}}年" → ["徳川家康は", {type: 'answer', text: '1603'}, "年"]
 */
export function parseAnswerSyntax(text: string): (string | AnswerToken)[] {
  const result: (string | AnswerToken)[] = [];
  const regex = /\{\{(.+?)\}\}/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // マッチ前の通常テキスト
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }
    // {{...}} で囲まれた解答部分
    result.push({
      type: 'answer',
      text: match[1],
    });
    lastIndex = regex.lastIndex;
  }

  // 残りのテキスト
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result.length > 0 ? result : [text];
}

/**
 * HTML spanタグのstyle属性から #E8740C を検出
 */
export function isAnswerSpan(styleAttr: string | undefined): boolean {
  if (!styleAttr) return false;
  // #E8740C（大文字小文字不問）を検出
  return /color:\s*#E8740C/i.test(styleAttr);
}

/**
 * Markdownファイルのfrontmatterとcontentを解析
 */
export function parseMarkdownFile(
  id: string,
  rawContent: string
): MarkdownFile {
  const { data, content } = matter(rawContent);

  return {
    id,
    title: data.title || 'Untitled',
    subject: data.subject || '未分類',
    content,
  };
}

// サーバーサイドでのファイル読み込みはコメントアウト
// クライアントコンポーネントから import されるとエラーになるため
// 必要な場合は別ファイル（例: lib/serverMarkdown.ts）に分離する

// /**
//  * /content/ ディレクトリ内のMarkdownファイルを読み込む（サーバーサイド用）
//  */
// export async function loadStaticMarkdownFiles(): Promise<MarkdownFile[]> {
//   const fs = await import('fs/promises');
//   const path = await import('path');
//   const contentDir = path.join(process.cwd(), 'content');
//   ... 省略 ...
// }
