import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { MarkdownFile } from './markdown';

interface AnkipanDB extends DBSchema {
  files: {
    key: string;
    value: MarkdownFile & { uploadedAt: string };
    indexes: { 'by-subject': string; 'by-date': string };
  };
}

let dbPromise: Promise<IDBPDatabase<AnkipanDB>> | null = null;

/**
 * IndexedDBを初期化
 */
function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<AnkipanDB>('ankipan-db', 1, {
      upgrade(db) {
        const fileStore = db.createObjectStore('files', { keyPath: 'id' });
        fileStore.createIndex('by-subject', 'subject');
        fileStore.createIndex('by-date', 'lastStudied');
      },
    });
  }
  return dbPromise;
}

/**
 * ファイルを保存
 */
export async function saveFile(file: MarkdownFile): Promise<void> {
  const db = await getDB();
  await db.put('files', {
    ...file,
    uploadedAt: new Date().toISOString(),
  });
}

/**
 * ファイルを取得
 */
export async function getFile(id: string): Promise<MarkdownFile | undefined> {
  const db = await getDB();
  return await db.get('files', id);
}

/**
 * 全ファイルを取得
 */
export async function getAllFiles(): Promise<MarkdownFile[]> {
  const db = await getDB();
  return await db.getAll('files');
}

/**
 * ファイルを削除
 */
export async function deleteFile(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('files', id);
}

/**
 * 最後に学習した日時を更新
 */
export async function updateLastStudied(id: string): Promise<void> {
  const db = await getDB();
  const file = await db.get('files', id);
  if (file) {
    file.lastStudied = new Date().toISOString();
    await db.put('files', file);
  }
}

/**
 * 全データをJSON形式でエクスポート
 */
export async function exportData(): Promise<string> {
  const files = await getAllFiles();
  return JSON.stringify(files, null, 2);
}

/**
 * JSON形式のデータをインポート
 */
export async function importData(jsonData: string): Promise<void> {
  const files = JSON.parse(jsonData) as MarkdownFile[];
  const db = await getDB();

  for (const file of files) {
    await db.put('files', {
      ...file,
      uploadedAt: new Date().toISOString(),
    });
  }
}
