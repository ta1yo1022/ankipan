'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import FileList from './FileList';
import FileUploader from './FileUploader';
import { getAllFiles } from '@/lib/storage';
import { MarkdownFile } from '@/lib/markdown';

interface HomeClientProps {
  staticFiles: MarkdownFile[];
}

/**
 * ホームページのクライアントコンポーネント
 */
export default function HomeClient({ staticFiles }: HomeClientProps) {
  const [uploadedFiles, setUploadedFiles] = useState<MarkdownFile[]>([]);
  const [showUploader, setShowUploader] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUploadedFiles = async () => {
    setLoading(true);
    const files = await getAllFiles();
    setUploadedFiles(files);
    setLoading(false);
  };

  useEffect(() => {
    loadUploadedFiles();
  }, []);

  const handleFileAdded = () => {
    setShowUploader(false);
    loadUploadedFiles();
  };

  const handleFileDeleted = () => {
    loadUploadedFiles();
  };

  // 静的ファイルとアップロードされたファイルを統合
  const allFiles = [...staticFiles, ...uploadedFiles];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '20px',
      }}
    >
      {/* ヘッダー */}
      <header
        style={{
          maxWidth: '1200px',
          margin: '0 auto 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#e60033',
            fontFamily: '"Noto Sans JP", sans-serif',
          }}
        >
          Ankipan
        </h1>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link
            href="/settings"
            style={{
              padding: '10px 20px',
              backgroundColor: 'white',
              color: '#666',
              textDecoration: 'none',
              borderRadius: '6px',
              border: '1px solid #ddd',
              fontWeight: 'bold',
            }}
          >
            設定
          </Link>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* ファイル追加ボタン */}
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={() => setShowUploader(!showUploader)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#e60033',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            {showUploader ? 'キャンセル' : '+ 新しいファイルを追加'}
          </button>
        </div>

        {/* ファイルアップローダー */}
        {showUploader && (
          <div style={{ marginBottom: '32px' }}>
            <FileUploader onFileAdded={handleFileAdded} />
          </div>
        )}

        {/* ファイル一覧 */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            読み込み中...
          </div>
        ) : (
          <FileList files={allFiles} onFileDeleted={handleFileDeleted} />
        )}
      </main>
    </div>
  );
}
