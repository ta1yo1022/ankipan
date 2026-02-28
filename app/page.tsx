import HomeClient from '@/components/HomeClient';
import { loadStaticMarkdownFiles } from '@/lib/serverMarkdown';

/**
 * ファイル一覧画面（トップページ）- サーバーコンポーネント
 */
export default async function HomePage() {
  // サーバーサイドで静的ファイルを読み込み
  const staticFiles = await loadStaticMarkdownFiles();

  return <HomeClient staticFiles={staticFiles} />;
}
