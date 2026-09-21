import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

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
const keys: Record<StorageMode, string> = { sqlite: '@org-notes/web-sqlite', files: '@org-notes/web-files' };
const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
const nowIso = () => new Date().toISOString();
const sampleNote: Note = { id: 'sample-meeting', title: 'Еженедельное совещание', date: '09.08.2026', time: '10:00', content: 'Обсудить статус проекта, ключевые риски и план задач на следующую неделю.', updatedAt: '2026-08-09T07:00:00.000Z' };

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [mode, setMode] = useState<StorageMode>('sqlite');
  const [isLoading, setIsLoading] = useState(true);
  const read = useCallback(async (activeMode: StorageMode) => {
    const raw = await AsyncStorage.getItem(keys[activeMode]);
    return raw ? JSON.parse(raw) as Note[] : [];
  }, []);
  const write = useCallback(async (items: Note[], activeMode: StorageMode) => {
    await AsyncStorage.setItem(keys[activeMode], JSON.stringify(items));
    setNotes(items);
  }, []);
  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const storedMode = await AsyncStorage.getItem(MODE_KEY);
      const activeMode: StorageMode = storedMode === 'files' ? 'files' : 'sqlite';
      setMode(activeMode);
      let items = await read(activeMode);
      if (items.length === 0) {
        items = [sampleNote];
        await write(items, activeMode);
      } else setNotes(items);
    } finally { setIsLoading(false); }
  }, [read, write]);
  useEffect(() => { void reload(); }, [reload]);
  const createNote = useCallback(async (draft: Omit<Note, 'id' | 'updatedAt'>) => write([{ ...draft, id: makeId(), updatedAt: nowIso() }, ...notes], mode), [mode, notes, write]);
  const updateNote = useCallback(async (note: Note) => write(notes.map((item) => item.id === note.id ? { ...note, updatedAt: nowIso() } : item), mode), [mode, notes, write]);
  const deleteNote = useCallback(async (id: string) => write(notes.filter((item) => item.id !== id), mode), [mode, notes, write]);
  const switchMode = useCallback(async (nextMode: StorageMode) => {
    if (nextMode === mode) return;
    await AsyncStorage.setItem(MODE_KEY, nextMode);
    let items = await read(nextMode);
    if (items.length === 0) { items = [sampleNote]; await write(items, nextMode); } else setNotes(items);
    setMode(nextMode);
  }, [mode, read, write]);
  const value = useMemo(() => ({ notes, mode, isLoading, createNote, updateNote, deleteNote, switchMode, reload }), [createNote, deleteNote, isLoading, mode, notes, reload, switchMode, updateNote]);
  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) throw new Error('useNotes must be used within NotesProvider');
  return context;
}