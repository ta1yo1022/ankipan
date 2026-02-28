'use client';

import { useState, useEffect } from 'react';
import { loadSettings, saveSettings, AppSettings } from '@/lib/settings';
import { exportData, importData } from '@/lib/storage';

/**
 * 設定フォームコンポーネント
 */
export default function SettingsForm() {
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const handleChange = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    if (!settings) return;
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveSettings({ [key]: value });
  };

  const handleExport = async () => {
    try {
      const data = await exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ankipan-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('エクスポートに失敗しました');
    }
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        await importData(text);
        alert('データをインポートしました');
        window.location.href = '/';
      } catch (error) {
        alert('インポートに失敗しました');
      }
    };
    input.click();
  };

  if (!settings) {
    return <div>読み込み中...</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '32px',
          color: '#e60033',
        }}
      >
        設定
      </h1>

      {/* 赤シートの色 */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
          赤シートの色
        </h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          {(['red', 'green', 'blue'] as const).map((color) => (
            <button
              key={color}
              onClick={() => handleChange('sheetColor', color)}
              style={{
                padding: '12px 24px',
                backgroundColor:
                  settings.sheetColor === color ? '#e60033' : '#f0f0f0',
                color: settings.sheetColor === color ? 'white' : '#333',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              {color === 'red' && '赤'}
              {color === 'green' && '緑'}
              {color === 'blue' && '青'}
            </button>
          ))}
        </div>
      </div>

      {/* フォントサイズ */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
          フォントサイズ
        </h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          {(['small', 'medium', 'large'] as const).map((size) => (
            <button
              key={size}
              onClick={() => handleChange('fontSize', size)}
              style={{
                padding: '12px 24px',
                backgroundColor:
                  settings.fontSize === size ? '#e60033' : '#f0f0f0',
                color: settings.fontSize === size ? 'white' : '#333',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              {size === 'small' && '小'}
              {size === 'medium' && '中'}
              {size === 'large' && '大'}
            </button>
          ))}
        </div>
      </div>

      {/* ダークモード */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
          ダークモード
        </h2>
        <label style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="checkbox"
            checked={settings.darkMode}
            onChange={(e) => handleChange('darkMode', e.target.checked)}
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          />
          <span>ダークモードを有効にする</span>
        </label>
      </div>

      {/* データ管理 */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
          データ管理
        </h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleExport}
            style={{
              padding: '12px 24px',
              backgroundColor: '#f0f0f0',
              color: '#333',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            エクスポート
          </button>
          <button
            onClick={handleImport}
            style={{
              padding: '12px 24px',
              backgroundColor: '#f0f0f0',
              color: '#333',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            インポート
          </button>
        </div>
      </div>

      {/* ホームに戻る */}
      <div style={{ marginTop: '48px' }}>
        <a
          href="/"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#e60033',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
          }}
        >
          ホームに戻る
        </a>
      </div>
    </div>
  );
}
