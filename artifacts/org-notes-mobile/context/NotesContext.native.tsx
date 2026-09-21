import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { useSQLiteContext } from 'expo-sqlite';
import React, { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

export type StorageMode = 'sqlite' | 'files';
export type Note = { id: string; title: string; date: string; time: string; content: string; updatedAt: string };
type NotesContextValue = {
  notes: Note[];
  mode: StorageMode;
  isLoading: boolean;
  createNote: (note: Omit<Note, 'id' | 'updatedAt'>) => Promise<void>;
  updateNote: (note: Note) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  switchMode: (mode: StorageMode) => Promise<void>;
  reload: () => Promise<void>;
};

const NotesContext = createContext<NotesContextValue | null>(null);
const MODE_KEY = '@org-notes/storage-mode';
const FILE_DIRECTORY = `${FileSystem.documentDirectory ?? ''}org-notes/`;
const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
const nowIso = () => new Date().toISOString();
const sampleNote: Note = {
  id: 'sample-meeting',
  title: 'Еженедельное совещание',
  date: '09.08.2026',
  time: '10:00',
  content: 'Обсудить статус проекта, ключевые риски и план задач на следующую неделю.',
  updatedAt: '2026-08-09T07:00:00.000Z',
};

export function NotesProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [notes, setNotes] = useState<Note[]>([]);
  const [mode, setMode] = useState<StorageMode>('sqlite');
  const [isLoading, setIsLoading] = useState(true);

  const ensureSqlite = useCallback(async () => {
    await db.execAsync(`CREATE TABLE IF NOT EXISTS notes (id TEXT PRIMARY KEY NOT NULL, title TEXT NOT NULL, date TEXT NOT NULL, time TEXT NOT NULL, content TEXT NOT NULL, updated_at TEXT NOT NULL);`);
  }, [db]);

  const ensureFiles = useCallback(async () => {
    if (!FileSystem.documentDirectory) return;
    const info = await FileSystem.getInfoAsync(FILE_DIRECTORY);
    if (!info.exists) await FileSystem.makeDirectoryAsync(FILE_DIRECTORY, { intermediates: true });
  }, []);

  const readSqlite = useCallback(async () => {
    await ensureSqlite();
    const rows = await db.getAllAsync<{ id: string; title: string; date: string; time: string; content: string; updated_at: string }>('SELECT id, title, date, time, content, updated_at FROM notes ORDER BY date DESC, time DESC');
    return rows.map((row) => ({ ...row, updatedAt: row.updated_at }));
  }, [db, ensureSqlite]);

  const writeSqlite = useCallback(async (items: Note[]) => {
    await ensureSqlite();
    await db.withExclusiveTransactionAsync(async (transaction) => {
      await transaction.runAsync('DELETE FROM notes');
      for (const note of items) {
        await transaction.runAsync('INSERT INTO notes (id, title, date, time, content, updated_at) VALUES (?, ?, ?, ?, ?, ?)', note.id, note.title, note.date, note.time, note.content, note.updatedAt);
      }
    });
  }, [db, ensureSqlite]);

  const readFiles = useCallback(async () => {
    await ensureFiles();
    if (!FileSystem.documentDirectory) return [];
    const fileNames = await FileSystem.readDirectoryAsync(FILE_DIRECTORY);
    const contents = await Promise.all(fileNames.filter((name) => name.endsWith('.json')).map(async (name) => JSON.parse(await FileSystem.readAsStringAsync(`${FILE_DIRECTORY}${name}`)) as Note));
    return contents.sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
  }, [ensureFiles]);

  const writeFiles = useCallback(async (items: Note[]) => {
    await ensureFiles();
    if (!FileSystem.documentDirectory) return;
    const existing = await FileSystem.readDirectoryAsync(FILE_DIRECTORY);
    await Promise.all(existing.filter((name) => name.endsWith('.json')).map((name) => FileSystem.deleteAsync(`${FILE_DIRECTORY}${name}`, { idempotent: true })));
    await Promise.all(items.map((note) => FileSystem.writeAsStringAsync(`${FILE_DIRECTORY}${note.id}.json`, JSON.stringify(note, null, 2))));
  }, [ensureFiles]);

  const readActive = useCallback((activeMode: StorageMode) => activeMode === 'sqlite' ? readSqlite() : readFiles(), [readFiles, readSqlite]);
  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const storedMode = await AsyncStorage.getItem(MODE_KEY);
      const activeMode: StorageMode = storedMode === 'files' ? 'files' : 'sqlite';
      setMode(activeMode);
      let items = await readActive(activeMode);
      if (items.length === 0) {
        items = [sampleNote];
        if (activeMode === 'sqlite') await writeSqlite(items); else await writeFiles(items);
      }
      setNotes(items);
    } finally { setIsLoading(false); }
  }, [readActive, writeFiles, writeSqlite]);
  useEffect(() => { void reload(); }, [reload]);

  const persist = useCallback(async (items: Note[], activeMode = mode) => {
    if (activeMode === 'sqlite') await writeSqlite(items); else await writeFiles(items);
    setNotes(items);
  }, [mode, writeFiles, writeSqlite]);
  const createNote = useCallback(async (draft: Omit<Note, 'id' | 'updatedAt'>) => {
    await persist([{ ...draft, id: makeId(), updatedAt: nowIso() }, ...notes]);
  }, [notes, persist]);
  const updateNote = useCallback(async (note: Note) => {
    await persist(notes.map((item) => item.id === note.id ? { ...note, updatedAt: nowIso() } : item));
  }, [notes, persist]);
  const deleteNote = useCallback(async (id: string) => {
    await persist(notes.filter((item) => item.id !== id));
  }, [notes, persist]);
  const switchMode = useCallback(async (nextMode: StorageMode) => {
    if (nextMode === mode) return;
    await AsyncStorage.setItem(MODE_KEY, nextMode);
    let nextNotes = await readActive(nextMode);
    if (nextNotes.length === 0) {
      nextNotes = [sampleNote];
      if (nextMode === 'sqlite') await writeSqlite(nextNotes); else await writeFiles(nextNotes);
    }
    setMode(nextMode);
    setNotes(nextNotes);
  }, [mode, readActive, writeFiles, writeSqlite]);
  const value = useMemo(() => ({ notes, mode, isLoading, createNote, updateNote, deleteNote, switchMode, reload }), [createNote, deleteNote, isLoading, mode, notes, reload, switchMode, updateNote]);
  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) throw new Error('useNotes must be used within NotesProvider');
  return context;
}