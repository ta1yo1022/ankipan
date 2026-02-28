'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StudyView from './StudyView';
import RedSheet from './RedSheet';
import Toolbar from './Toolbar';
import { updateLastStudied } from '@/lib/storage';
import { MarkdownFile } from '@/lib/markdown';
import { loadSettings, saveSettings } from '@/lib/settings';

interface StudyClientProps {
  file: MarkdownFile;
}

/**
 * 学習画面のクライアントコンポーネント
 */
export default function StudyClient({ file }: StudyClientProps) {
  const router = useRouter();
  const [sheetVisible, setSheetVisible] = useState(true);
  const [opacity, setOpacity] = useState(0.78);
  const [allAnswersRevealed, setAllAnswersRevealed] = useState(false);

  useEffect(() => {
    // IndexedDBのファイル（static-で始まらない）のみ最終学習日時を更新
    if (!file.id.startsWith('static-')) {
      updateLastStudied(file.id);
    }

    // 設定を読み込み
    const settings = loadSettings();
    setOpacity(settings.sheetOpacity);
  }, [file.id]);

  const handleOpacityChange = (newOpacity: number) => {
    setOpacity(newOpacity);
    saveSettings({ sheetOpacity: newOpacity });
  };

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
      <StudyView content={file.content} allAnswersRevealed={allAnswersRevealed} />

      {/* 赤シート */}
      <RedSheet
        visible={sheetVisible}
        opacity={opacity}
        onOpacityChange={handleOpacityChange}
      />

      {/* ツールバー */}
      <Toolbar
        sheetVisible={sheetVisible}
        onToggleSheet={() => setSheetVisible(!sheetVisible)}
        opacity={opacity}
        onOpacityChange={handleOpacityChange}
        onToggleAllAnswers={() => setAllAnswersRevealed(!allAnswersRevealed)}
        allAnswersRevealed={allAnswersRevealed}
      />
    </div>
  );
}
