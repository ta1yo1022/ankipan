import { promises as fs } from 'fs';
import path from 'path';
import { parseMarkdownFile, MarkdownFile } from './markdown';

/**
 * /content/ ディレクトリ内のMarkdownファイルを読み込む（サーバーサイド専用）
 * この関数はサーバーコンポーネントからのみ呼び出せます
 */
export async function loadStaticMarkdownFiles(): Promise<MarkdownFile[]> {
  const contentDir = path.join(process.cwd(), 'content');

  try {
    const files = await fs.readdir(contentDir);
    const mdFiles = files.filter(file => file.endsWith('.md'));

    const markdownFiles = await Promise.all(
      mdFiles.map(async (file) => {
        const filePath = path.join(contentDir, file);
        const rawContent = await fs.readFile(filePath, 'utf-8');
        const id = `static-${file.replace(/\.md$/, '')}`;
        return parseMarkdownFile(id, rawContent);
      })
    );

    return markdownFiles;
  } catch (error) {
    // contentディレクトリが存在しない場合は空配列を返す
    console.log('Content directory not found or empty');
    return [];
  }
}

/**
 * 特定の静的ファイルを読み込む（サーバーサイド専用）
 */
export async function loadStaticMarkdownFile(id: string): Promise<MarkdownFile | null> {
  if (!id.startsWith('static-')) {
    return null;
  }

  const fileName = id.replace('static-', '') + '.md';
  const filePath = path.join(process.cwd(), 'content', fileName);

  try {
    const rawContent = await fs.readFile(filePath, 'utf-8');
    return parseMarkdownFile(id, rawContent);
  } catch (error) {
    console.log(`Static file not found: ${fileName}`);
    return null;
  }
}
