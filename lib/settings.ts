export interface AppSettings {
  sheetColor: 'red' | 'green' | 'blue';
  fontSize: 'small' | 'medium' | 'large';
  darkMode: boolean;
  sheetOpacity: number; // 0-1
  sheetPosition: { x: number; y: number };
  sheetSize: { width: number; height: number };
}

const DEFAULT_SETTINGS: AppSettings = {
  sheetColor: 'red',
  fontSize: 'medium',
  darkMode: false,
  sheetOpacity: 0.85,
  sheetPosition: { x: 50, y: 100 },
  sheetSize: { width: 300, height: 200 },
};

const SETTINGS_KEY = 'ankipan-settings';

/**
 * 設定を読み込み
 */
export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS;
  }

  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }

  return DEFAULT_SETTINGS;
}

/**
 * 設定を保存
 */
export function saveSettings(settings: Partial<AppSettings>): void {
  if (typeof window === 'undefined') return;

  try {
    const current = loadSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

/**
 * 赤シートの色に対応するRGBA値を取得
 */
export function getSheetColorRGBA(color: AppSettings['sheetColor'], opacity: number): string {
  const colors = {
    red: `rgba(230, 0, 51, ${opacity})`,
    green: `rgba(40, 150, 40, ${opacity})`,
    blue: `rgba(40, 100, 220, ${opacity})`,
  };
  return colors[color];
}

/**
 * フォントサイズに対応するピクセル値を取得
 */
export function getFontSizeValue(size: AppSettings['fontSize']): string {
  const sizes = {
    small: '14px',
    medium: '16px',
    large: '18px',
  };
  return sizes[size];
}
