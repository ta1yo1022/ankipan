'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { loadSettings, saveSettings, getSheetColorRGBA } from '@/lib/settings';

interface RedSheetProps {
  visible: boolean;
  opacity: number;
  onOpacityChange?: (opacity: number) => void;
  resetTrigger?: number;
}

/**
 * 赤シートオーバーレイコンポーネント
 * ドラッグで移動、右下ハンドルでリサイズ可能
 */
export default function RedSheet({ visible, opacity, onOpacityChange, resetTrigger }: RedSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 50, y: 100 });
  const [size, setSize] = useState({ width: 300, height: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [sheetColor, setSheetColor] = useState<'red' | 'green' | 'blue'>('red');

  // 設定を読み込み
  useEffect(() => {
    const settings = loadSettings();
    setPosition(settings.sheetPosition);
    setSize(settings.sheetSize);
    setSheetColor(settings.sheetColor);
  }, []);

  // リセットトリガーを監視
  useEffect(() => {
    if (resetTrigger && resetTrigger > 0) {
      const defaultPosition = { x: 50, y: 100 };
      const defaultSize = { width: 300, height: 200 };
      setPosition(defaultPosition);
      setSize(defaultSize);
      saveSettings({
        sheetPosition: defaultPosition,
        sheetSize: defaultSize
      });
    }
  }, [resetTrigger]);

  // 赤シートと重なる解答要素を検出して透明にする
  const updateOverlappingAnswers = useCallback(() => {
    if (!visible || !sheetRef.current) {
      // 赤シートが非表示の場合は全て表示
      document.querySelectorAll('.answer, answer').forEach((el) => {
        (el as HTMLElement).style.opacity = '1';
      });
      return;
    }

    const sheetRect = sheetRef.current.getBoundingClientRect();
    const answers = document.querySelectorAll('.answer, answer');

    answers.forEach((answer) => {
      const answerRect = answer.getBoundingClientRect();

      // 重なりを検出
      const isOverlapping = !(
        answerRect.right < sheetRect.left ||
        answerRect.left > sheetRect.right ||
        answerRect.bottom < sheetRect.top ||
        answerRect.top > sheetRect.bottom
      );

      // 重なっていたら透明に、そうでなければ表示
      (answer as HTMLElement).style.opacity = isOverlapping ? '0' : '1';
    });
  }, [visible]);

  // 常時監視（リアルタイム更新）
  useEffect(() => {
    if (!visible) {
      // 赤シートが非表示の場合は全て表示
      document.querySelectorAll('.answer, answer').forEach((el) => {
        (el as HTMLElement).style.opacity = '1';
      });
      return;
    }

    let animationFrameId: number;
    let lastUpdate = 0;
    const throttleMs = 16; // 約60fps

    const checkOverlap = (timestamp: number) => {
      // throttle: 16msごとに実行
      if (timestamp - lastUpdate >= throttleMs) {
        updateOverlappingAnswers();
        lastUpdate = timestamp;
      }
      animationFrameId = requestAnimationFrame(checkOverlap);
    };

    animationFrameId = requestAnimationFrame(checkOverlap);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [visible, updateOverlappingAnswers]);

  // ドラッグ開始
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).classList.contains('resize-handle')) {
      return; // リサイズハンドルの場合はドラッグしない
    }

    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  // リサイズ開始
  const handleResizeStart = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsResizing(true);
    setDragStart({
      x: e.clientX - size.width,
      y: e.clientY - size.height,
    });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  // ドラッグ・リサイズ中
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setPosition({ x: newX, y: newY });
    } else if (isResizing) {
      const newWidth = Math.max(100, e.clientX - dragStart.x);
      const newHeight = Math.max(100, e.clientY - dragStart.y);
      setSize({ width: newWidth, height: newHeight });
    }
  };

  // ドラッグ・リサイズ終了
  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
      saveSettings({ sheetPosition: position });
    }
    if (isResizing) {
      setIsResizing(false);
      saveSettings({ sheetSize: size });
    }
  };

  if (!visible) return null;

  const backgroundColor = getSheetColorRGBA(sheetColor, opacity);

  return (
    <div
      ref={sheetRef}
      className="red-sheet"
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        backgroundColor,
        borderRadius: '8px',
        border: '2px solid rgba(150, 20, 20, 0.5)',
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        userSelect: 'none',
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        willChange: 'transform',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* ドラッグハンドル表示 */}
      <div
        style={{
          position: 'absolute',
          top: '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '40px',
          height: '4px',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          borderRadius: '2px',
          pointerEvents: 'none',
        }}
      />

      {/* リサイズハンドル（右下） */}
      <div
        className="resize-handle"
        onPointerDown={handleResizeStart}
        style={{
          position: 'absolute',
          bottom: '0',
          right: '0',
          width: '24px',
          height: '24px',
          cursor: 'nwse-resize',
          background:
            'linear-gradient(135deg, transparent 0%, transparent 50%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.4) 100%)',
          borderBottomRightRadius: '6px',
        }}
      />
    </div>
  );
}
