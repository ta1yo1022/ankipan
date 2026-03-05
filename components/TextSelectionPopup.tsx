'use client';

import { useEffect, useState } from 'react';

interface TextSelectionPopupProps {
  onAskAI: (selectedText: string) => void;
}

/**
 * テキスト選択時にポップアップボタンを表示
 */
export default function TextSelectionPopup({ onAskAI }: TextSelectionPopupProps) {
  const [selectedText, setSelectedText] = useState('');
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (text && text.length > 0) {
        setSelectedText(text);

        // 選択範囲の位置を取得
        const range = selection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();

        if (rect) {
          setPopupPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
          });
        }
      } else {
        setSelectedText('');
        setPopupPosition(null);
      }
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('touchend', handleSelection);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('touchend', handleSelection);
    };
  }, []);

  const handleAskClick = () => {
    if (selectedText) {
      onAskAI(selectedText);
      setSelectedText('');
      setPopupPosition(null);
      window.getSelection()?.removeAllRanges();
    }
  };

  if (!popupPosition || !selectedText) return null;

  return (
    <div
      className="no-print"
      style={{
        position: 'fixed',
        left: `${popupPosition.x}px`,
        top: `${popupPosition.y}px`,
        transform: 'translate(-50%, -100%)',
        zIndex: 9999,
        backgroundColor: '#333',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        whiteSpace: 'nowrap',
        userSelect: 'none',
      }}
      onClick={handleAskClick}
    >
      AIに質問
    </div>
  );
}
