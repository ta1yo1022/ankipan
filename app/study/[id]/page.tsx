'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import StudyView from '@/components/StudyView';
import RedSheet from '@/components/RedSheet';
import Toolbar from '@/components/Toolbar';
import { getFile, updateLastStudied } from '@/lib/storage';
import { MarkdownFile } from '@/lib/markdown';
import { loadSettings, saveSettings } from '@/lib/settings';

/**
 * 学習画面
 */
export default function StudyPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [file, setFile] = useState<MarkdownFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sheetVisible, setSheetVisible] = useState(true);
  const [opacity, setOpacity] = useState(0.85);
  const [resetTrigger, setResetTrigger] = useState(0);

  useEffect(() => {
    const loadFile = async () => {
      if (!id) return;

      setLoading(true);

      let fileData: MarkdownFile | null = null;

      if (id.startsWith('static-')) {
        // 静的ファイル: APIから取得
        try {
          const response = await fetch(`/api/static-file/${id}`);
          if (response.ok) {
            fileData = await response.json();
          }
        } catch (error) {
          console.error('Failed to load static file:', error);
        }
      } else {
        // IndexedDBのファイル
        const dbFile = await getFile(id);
        if (dbFile) {
          fileData = dbFile;
          await updateLastStudied(id);
        }
      }

      if (!fileData) {
        alert('ファイルが見つかりません');
        router.push('/');
        return;
      }

      setFile(fileData);
      setLoading(false);
    };

    loadFile();

    // 設定を読み込み
    const settings = loadSettings();
    setOpacity(settings.sheetOpacity);
  }, [id, router]);

  const handleOpacityChange = (newOpacity: number) => {
    setOpacity(newOpacity);
    saveSettings({ sheetOpacity: newOpacity });
  };

  const handleResetPosition = () => {
    setResetTrigger(prev => prev + 1);
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
        }}
      >
        <p style={{ fontSize: '18px', color: '#999' }}>読み込み中...</p>
      </div>
    );
  }

  if (!file) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* ヘッダー */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          backgroundColor: 'white',
          borderBottom: '1px solid #e0e0e0',
          padding: '16px 20px',
          zIndex: 998,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link
            href="/"
            style={{
              color: '#666',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            ← 戻る
          </Link>

          <div style={{ flex: 1, textAlign: 'center', padding: '0 20px' }}>
            <h1
              style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#333',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {file.title}
            </h1>
            <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
              {file.subject}
            </p>
          </div>

          <div style={{ width: '60px' }}></div>
        </div>
      </header>

      {/* Markdownコンテンツ */}
      <StudyView content={file.content} />

      {/* 赤シート */}
      <RedSheet
        visible={sheetVisible}
        opacity={opacity}
        onOpacityChange={handleOpacityChange}
        resetTrigger={resetTrigger}
      />

      {/* ツールバー */}
      <Toolbar
        sheetVisible={sheetVisible}
        onToggleSheet={() => setSheetVisible(!sheetVisible)}
        opacity={opacity}
        onOpacityChange={handleOpacityChange}
        onResetPosition={handleResetPosition}
      />
    </div>
  );
}
