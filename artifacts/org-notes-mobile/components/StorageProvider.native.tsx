import React, { ReactNode } from 'react';
import { SQLiteProvider } from 'expo-sqlite';

export function StorageProvider({ children }: { children: ReactNode }) {
  return <SQLiteProvider databaseName="org-notes.db">{children}</SQLiteProvider>;
}