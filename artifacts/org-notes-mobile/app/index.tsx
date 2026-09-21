import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Keyboard, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { Note, useNotes } from '@/context/NotesContext';

function NoteRow({ note, onPress, onDelete }: { note: Note; onPress: () => void; onDelete: () => void }) {
  const colors = useColors();
  return (
    <Pressable testID={`note-${note.id}`} onPress={onPress} style={({ pressed }) => [styles.noteRow, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.82 : 1 }]}>
      <View style={[styles.noteMarker, { backgroundColor: colors.amber }]} />
      <View style={styles.noteBody}>
        <View style={styles.noteTopline}>
          <Text numberOfLines={1} style={[styles.noteTitle, { color: colors.foreground }]}>{note.title}</Text>
          <Pressable testID={`delete-${note.id}`} accessibilityLabel="Удалить заметку" onPress={onDelete} hitSlop={10} style={({ pressed }) => ({ opacity: pressed ? 0.55 : 1 })}>
            <Feather name="trash-2" size={18} color={colors.mutedForeground} />
          </Pressable>
        </View>
        <Text numberOfLines={2} style={[styles.notePreview, { color: colors.mutedForeground }]}>{note.content || 'Без содержания'}</Text>
        <View style={styles.noteMeta}>
          <View style={styles.metaItem}><Feather name="calendar" size={13} color={colors.coral} /><Text style={[styles.metaText, { color: colors.mutedForeground }]}>{note.date}</Text></View>
          <View style={styles.metaItem}><Feather name="clock" size={13} color={colors.coral} /><Text style={[styles.metaText, { color: colors.mutedForeground }]}>{note.time}</Text></View>
        </View>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { notes, mode, isLoading, deleteNote, reload } = useNotes();
  const [query, setQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return notes;
    return notes.filter((note) => [note.title, note.content, note.date, note.time].some((value) => value.toLowerCase().includes(normalized)));
  }, [notes, query]);

  const confirmDelete = (note: Note) => {
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.(`Удалить заметку «${note.title}»?`)) void deleteNote(note.id);
      return;
    }
    // Native confirm is kept in the screen so accidental deletion is impossible.
    const { Alert } = require('react-native') as typeof import('react-native');
    Alert.alert('Удалить заметку?', `«${note.title}» будет удалена без возможности восстановления.`, [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: () => void deleteNote(note.id) },
    ]);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshing={isLoading}
        onRefresh={() => void reload()}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        scrollEnabled={filtered.length > 0}
        contentContainerStyle={{ paddingTop: insets.top + 18, paddingBottom: insets.bottom + 110, paddingHorizontal: 20 }}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View>
                <Text style={[styles.eyebrow, { color: colors.coral }]}>РАБОЧЕЕ ПРОСТРАНСТВО</Text>
                <Text style={[styles.heading, { color: colors.foreground }]}>Мои заметки</Text>
              </View>
              <View style={styles.headerActions}>
                <Pressable testID="guide-button" accessibilityLabel="Руководство" onPress={() => router.push('/guide')} style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.6 : 1 }]}><Feather name="book-open" size={19} color={colors.foreground} /></Pressable>
                <Pressable testID="settings-button" accessibilityLabel="Настройки" onPress={() => router.push('/settings')} style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.6 : 1 }]}><Feather name="sliders" size={19} color={colors.foreground} /></Pressable>
              </View>
            </View>
            <View style={[styles.summary, { backgroundColor: colors.primary }]}>
              <View>
                <Text style={[styles.summaryLabel, { color: colors.primaryForeground }]}>ВСЕГО ЗАПИСЕЙ</Text>
                <Text style={[styles.summaryValue, { color: colors.primaryForeground }]}>{notes.length}</Text>
              </View>
              <View style={[styles.storagePill, { backgroundColor: colors.accent }]}>
                <Ionicons name={mode === 'sqlite' ? 'server-outline' : 'document-text-outline'} size={14} color={colors.accentForeground} />
                <Text style={[styles.storagePillText, { color: colors.accentForeground }]}>{mode === 'sqlite' ? 'SQLite' : 'Файлы'}</Text>
              </View>
            </View>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Последние записи</Text>
              <Pressable testID="search-toggle" onPress={() => { setShowSearch((value) => !value); setQuery(''); }} style={({ pressed }) => ({ opacity: pressed ? 0.55 : 1 })}><Feather name={showSearch ? 'x' : 'search'} size={21} color={colors.foreground} /></Pressable>
            </View>
            {showSearch ? <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}><Feather name="search" size={17} color={colors.mutedForeground} /><TextInput testID="search-input" value={query} onChangeText={setQuery} autoFocus placeholder="Поиск по словам, дате или времени" placeholderTextColor={colors.mutedForeground} style={[styles.searchInput, { color: colors.foreground }]} returnKeyType="search" onSubmitEditing={Keyboard.dismiss} /></View> : null}
          </View>
        }
        renderItem={({ item }) => <NoteRow note={item} onPress={() => router.push({ pathname: '/editor', params: { id: item.id } })} onDelete={() => confirmDelete(item)} />}
        ListEmptyComponent={<View style={styles.empty}><View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}><Feather name="file-text" size={26} color={colors.mutedForeground} /></View><Text style={[styles.emptyTitle, { color: colors.foreground }]}>{query ? 'Ничего не найдено' : 'Пока нет заметок'}</Text><Text style={[styles.emptyText, { color: colors.mutedForeground }]}>{query ? 'Попробуйте другой запрос или дату.' : 'Создайте первую запись встречи, чтобы она появилась здесь.'}</Text></View>}
      />
      <Pressable testID="add-note-button" accessibilityLabel="Создать заметку" onPress={() => router.push('/editor')} style={({ pressed }) => [styles.fab, { backgroundColor: colors.coral, bottom: insets.bottom + 28, opacity: pressed ? 0.82 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] }]}><Feather name="plus" size={24} color={colors.primaryForeground} /><Text style={[styles.fabText, { color: colors.primaryForeground }]}>Новая заметка</Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 7 },
  heading: { fontSize: 30, fontFamily: 'Inter_700Bold', letterSpacing: -0.7 },
  headerActions: { flexDirection: 'row', gap: 9 },
  iconButton: { width: 42, height: 42, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  summary: { minHeight: 112, borderRadius: 24, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 },
  summaryLabel: { fontSize: 11, letterSpacing: 1.3, fontWeight: '700', opacity: 0.65 },
  summaryValue: { fontSize: 42, fontFamily: 'Inter_700Bold', lineHeight: 48, marginTop: 4 },
  storagePill: { borderRadius: 30, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 11, paddingVertical: 7 },
  storagePillText: { fontSize: 12, fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 13 },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold' },
  searchBox: { height: 48, borderRadius: 15, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10, marginBottom: 14 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular' },
  noteRow: { flexDirection: 'row', borderRadius: 19, borderWidth: 1, padding: 15, marginBottom: 11 },
  noteMarker: { width: 4, borderRadius: 4, marginRight: 12 },
  noteBody: { flex: 1 },
  noteTopline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  noteTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', flex: 1 },
  notePreview: { fontSize: 13, lineHeight: 19, marginTop: 7 },
  noteMeta: { flexDirection: 'row', gap: 14, marginTop: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  empty: { alignItems: 'center', paddingTop: 50, paddingHorizontal: 30 },
  emptyIcon: { width: 62, height: 62, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', marginBottom: 7 },
  emptyText: { textAlign: 'center', fontSize: 14, lineHeight: 21 },
  fab: { position: 'absolute', alignSelf: 'center', minHeight: 54, paddingHorizontal: 20, borderRadius: 18, flexDirection: 'row', alignItems: 'center', gap: 9, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.18, shadowRadius: 10, elevation: 7 },
  fabText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});