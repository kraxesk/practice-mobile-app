import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useColors } from '@/hooks/useColors';
import { useNotes } from '@/context/NotesContext';

export default function EditorScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { notes, createNote, updateNote } = useNotes();
  const existing = useMemo(() => notes.find((note) => note.id === id), [id, notes]);
  const today = new Date();
  const [title, setTitle] = useState(existing?.title ?? '');
  const [date, setDate] = useState(existing?.date ?? today.toLocaleDateString('ru-RU'));
  const [time, setTime] = useState(existing?.time ?? today.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }));
  const [content, setContent] = useState(existing?.content ?? '');
  const [error, setError] = useState('');
  const isEditing = Boolean(existing);

  const save = async () => {
    if (!title.trim()) { setError('Добавьте заголовок заметки'); return; }
    setError('');
    const payload = { title: title.trim(), date: date.trim(), time: time.trim(), content: content.trim() };
    if (existing) await updateNote({ ...existing, ...payload });
    else await createNote(payload);
    router.back();
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8, borderBottomColor: colors.border }]}>
        <Pressable testID="back-button" accessibilityLabel="Назад" onPress={() => router.back()} style={({ pressed }) => [styles.topButton, { opacity: pressed ? 0.55 : 1 }]}><Feather name="arrow-left" size={22} color={colors.foreground} /></Pressable>
        <Text style={[styles.topTitle, { color: colors.foreground }]}>{isEditing ? 'Редактирование' : 'Новая заметка'}</Text>
        <Pressable testID="save-note-button" accessibilityLabel="Сохранить заметку" onPress={() => void save()} style={({ pressed }) => [styles.saveButton, { backgroundColor: colors.primary, opacity: pressed ? 0.7 : 1 }]}><Text style={[styles.saveText, { color: colors.primaryForeground }]}>Сохранить</Text></Pressable>
      </View>
      <KeyboardAwareScrollViewCompat contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }} bottomOffset={30}>
        <Text style={[styles.formEyebrow, { color: colors.coral }]}>{isEditing ? 'ИЗМЕНИТЕ ДЕТАЛИ ЗАПИСИ' : 'ЗАПИШИТЕ ВАЖНОЕ'}</Text>
        <Text style={[styles.formHeading, { color: colors.foreground }]}>{isEditing ? 'Обновить детали' : 'Зафиксировать встречу'}</Text>
        <Text style={[styles.formHint, { color: colors.mutedForeground }]}>Заполните основные поля, чтобы потом быстро найти нужную мысль.</Text>
        <Text style={[styles.label, { color: colors.foreground }]}>Заголовок</Text>
        <TextInput testID="title-input" value={title} onChangeText={setTitle} placeholder="Например, Планёрка отдела" placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: error ? colors.destructive : colors.border, backgroundColor: colors.card }]} />
        {error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}
        <View style={styles.fieldRow}>
          <View style={styles.half}><Text style={[styles.label, { color: colors.foreground }]}>Дата</Text><View style={[styles.inputWithIcon, { borderColor: colors.border, backgroundColor: colors.card }]}><Feather name="calendar" size={16} color={colors.coral} /><TextInput testID="date-input" value={date} onChangeText={setDate} placeholder="ДД.ММ.ГГГГ" placeholderTextColor={colors.mutedForeground} style={[styles.rowInput, { color: colors.foreground }]} /></View></View>
          <View style={styles.half}><Text style={[styles.label, { color: colors.foreground }]}>Время</Text><View style={[styles.inputWithIcon, { borderColor: colors.border, backgroundColor: colors.card }]}><Feather name="clock" size={16} color={colors.coral} /><TextInput testID="time-input" value={time} onChangeText={setTime} placeholder="10:00" placeholderTextColor={colors.mutedForeground} style={[styles.rowInput, { color: colors.foreground }]} /></View></View>
        </View>
        <Text style={[styles.label, { color: colors.foreground }]}>Содержание</Text>
        <TextInput testID="content-input" value={content} onChangeText={setContent} multiline textAlignVertical="top" placeholder="Основные мысли, решения и следующие шаги..." placeholderTextColor={colors.mutedForeground} style={[styles.contentInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]} />
        <View style={[styles.tip, { backgroundColor: colors.secondary }]}><Feather name="info" size={16} color={colors.foreground} /><Text style={[styles.tipText, { color: colors.secondaryForeground }]}>Заметка сохранится в выбранном хранилище на устройстве.</Text></View>
        <Pressable testID="save-bottom-button" onPress={() => void save()} style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.coral, opacity: pressed ? 0.8 : 1 }]}><Feather name="check" size={18} color={colors.primaryForeground} /><Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>{isEditing ? 'Сохранить изменения' : 'Создать заметку'}</Text></Pressable>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: { paddingHorizontal: 18, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, gap: 12 },
  topButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  topTitle: { flex: 1, fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  saveButton: { borderRadius: 12, paddingHorizontal: 13, paddingVertical: 9 },
  saveText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  formEyebrow: { fontSize: 11, letterSpacing: 1.3, fontFamily: 'Inter_700Bold', marginTop: 8, marginBottom: 8 },
  formHeading: { fontSize: 27, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  formHint: { fontSize: 14, lineHeight: 20, marginTop: 7, marginBottom: 27 },
  label: { fontSize: 13, fontFamily: 'Inter_600SemiBold', marginBottom: 8 },
  input: { minHeight: 52, borderRadius: 15, borderWidth: 1, paddingHorizontal: 15, fontSize: 15, fontFamily: 'Inter_400Regular', marginBottom: 17 },
  error: { fontSize: 12, marginTop: -10, marginBottom: 14 },
  fieldRow: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  inputWithIcon: { minHeight: 52, borderRadius: 15, borderWidth: 1, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 17 },
  rowInput: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular' },
  contentInput: { minHeight: 175, borderRadius: 15, borderWidth: 1, padding: 15, fontSize: 15, lineHeight: 22, fontFamily: 'Inter_400Regular' },
  tip: { borderRadius: 14, padding: 13, marginTop: 18, flexDirection: 'row', gap: 9, alignItems: 'flex-start' },
  tipText: { flex: 1, fontSize: 12, lineHeight: 18 },
  primaryButton: { minHeight: 53, borderRadius: 17, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 24 },
  primaryButtonText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});