'use client';

interface ToolbarProps {
  sheetVisible: boolean;
  onToggleSheet: () => void;
  opacity: number;
  onOpacityChange: (opacity: number) => void;
}

/**
 * 学習画面のツールバー
 * 赤シートのON/OFF、透明度調整
 */
export default function Toolbar({
  sheetVisible,
  onToggleSheet,
  opacity,
  onOpacityChange,
}: ToolbarProps) {
  return (
    <div
      className="toolbar"
      style={{
        position: 'fixed',
        bottom: 'env(safe-area-inset-bottom, 0)',
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid #e0e0e0',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        zIndex: 999,
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* 赤シート ON/OFF */}
      <button
        onClick={onToggleSheet}
        style={{
          padding: '8px 16px',
          backgroundColor: sheetVisible ? '#e60033' : '#f0f0f0',
          color: sheetVisible ? 'white' : '#333',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 'bold',
          cursor: 'pointer',
          fontSize: '14px',
          whiteSpace: 'nowrap',
        }}
      >
        {sheetVisible ? '赤シートON' : '赤シートOFF'}
      </button>

      {/* 透明度スライダー */}
      {sheetVisible && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <span style={{ fontSize: '12px', color: '#666', whiteSpace: 'nowrap' }}>
            透明度
          </span>
          <input
            type="range"
            min="0.3"
            max="1"
            step="0.05"
            value={opacity}
            onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
            style={{
              flex: 1,
              maxWidth: '150px',
            }}
          />
        </div>
      )}
    </div>
  );
}
