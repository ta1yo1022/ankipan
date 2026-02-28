'use client';

import Link from 'next/link';
import { MarkdownFile } from '@/lib/markdown';
import { deleteFile } from '@/lib/storage';

interface FileListProps {
  files: MarkdownFile[];
  onFileDeleted: () => void;
}

/**
 * ファイル一覧カード表示コンポーネント
 */
export default function FileList({ files, onFileDeleted }: FileListProps) {
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (confirm('このファイルを削除しますか?')) {
      await deleteFile(id);
      onFileDeleted();
    }
  };

  // 教科ごとにグループ化
  const groupedFiles = files.reduce((acc, file) => {
    const subject = file.subject || '未分類';
    if (!acc[subject]) {
      acc[subject] = [];
    }
    acc[subject].push(file);
    return acc;
  }, {} as Record<string, MarkdownFile[]>);

  if (files.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
        <p style={{ fontSize: '16px' }}>まだファイルがありません</p>
        <p style={{ fontSize: '14px', marginTop: '8px' }}>
          上のボタンからMarkdownファイルを追加してください
        </p>
      </div>
    );
  }

  return (
    <div>
      {Object.entries(groupedFiles).map(([subject, subjectFiles]) => (
        <div key={subject} style={{ marginBottom: '32px' }}>
          {/* 教科名 */}
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '16px',
              color: '#e60033',
              borderBottom: '2px solid #e60033',
              paddingBottom: '8px',
            }}
          >
            {subject}
          </h2>

          {/* ファイルカード */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {subjectFiles.map((file) => (
              <Link
                key={file.id}
                href={`/study/${file.id}`}
                style={{
                  textDecoration: 'none',
                  display: 'block',
                }}
              >
                <div
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '20px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(230, 0, 51, 0.2)';
                    e.currentTarget.style.borderColor = '#e60033';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.borderColor = '#e0e0e0';
                  }}
                >
                  {/* タイトル */}
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#333',
                      marginBottom: '8px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {file.title}
                  </h3>

                  {/* 最終学習日時 */}
                  {file.lastStudied && (
                    <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                      最終学習: {new Date(file.lastStudied).toLocaleDateString('ja-JP')}
                    </p>
                  )}

                  {/* 削除ボタン */}
                  <button
                    onClick={(e) => handleDelete(file.id, e)}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      padding: '4px 8px',
                      backgroundColor: '#f0f0f0',
                      color: '#666',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffebee';
                      e.currentTarget.style.color = '#e60033';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0f0f0';
                      e.currentTarget.style.color = '#666';
                    }}
                  >
                    削除
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
