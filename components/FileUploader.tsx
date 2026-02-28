'use client';

import { useRef, useState } from 'react';
import { saveFile } from '@/lib/storage';
import { parseMarkdownFile } from '@/lib/markdown';

interface FileUploaderProps {
  onFileAdded: () => void;
}

/**
 * ファイルアップロードコンポーネント（ドラッグ＆ドロップ対応）
 */
export default function FileUploader({ onFileAdded }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textContent, setTextContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.name.endsWith('.md')) {
      alert('Markdownファイル (.md) を選択してください');
      return;
    }

    const content = await file.text();
    const id = `upload-${Date.now()}`;
    const mdFile = parseMarkdownFile(id, content);

    await saveFile(mdFile);
    onFileAdded();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    await handleFiles(e.dataTransfer.files);
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await handleFiles(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTextSubmit = async () => {
    if (!textContent.trim()) return;

    const id = `text-${Date.now()}`;
    const mdFile = parseMarkdownFile(id, textContent);

    await saveFile(mdFile);
    setTextContent('');
    setShowTextInput(false);
    onFileAdded();
  };

  if (showTextInput) {
    return (
      <div
        style={{
          border: '2px solid #e60033',
          borderRadius: '8px',
          padding: '20px',
          backgroundColor: 'white',
        }}
      >
        <h3 style={{ marginBottom: '12px', fontSize: '18px', fontWeight: 'bold' }}>
          Markdownを貼り付け
        </h3>
        <textarea
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          placeholder="Markdownテキストをここに貼り付けてください..."
          style={{
            width: '100%',
            minHeight: '200px',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            fontFamily: 'monospace',
            resize: 'vertical',
          }}
        />
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button
            onClick={handleTextSubmit}
            style={{
              padding: '10px 20px',
              backgroundColor: '#e60033',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            保存
          </button>
          <button
            onClick={() => {
              setShowTextInput(false);
              setTextContent('');
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f0f0f0',
              color: '#333',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            キャンセル
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${isDragging ? '#e60033' : '#ccc'}`,
        borderRadius: '8px',
        padding: '40px 20px',
        textAlign: 'center',
        backgroundColor: isDragging ? '#fff5f7' : 'white',
        transition: 'all 0.2s ease',
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".md"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />

      <p style={{ fontSize: '16px', marginBottom: '20px', color: '#666' }}>
        Markdownファイルをドラッグ＆ドロップ
      </p>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: '12px 24px',
            backgroundColor: '#e60033',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          ファイルを選択
        </button>

        <button
          onClick={() => setShowTextInput(true)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#f0f0f0',
            color: '#333',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          テキストを貼り付け
        </button>
      </div>
    </div>
  );
}
