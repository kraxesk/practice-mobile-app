import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { StorageMode, useNotes } from '@/context/NotesContext';

function ModeCard({ active, icon, title, description, onPress }: { active: boolean; icon: keyof typeof Feather.glyphMap; title: string; description: string; onPress: () => void }) {
  const colors = useColors();
  return <Pressable testID={`mode-${title}`} onPress={onPress} style={({ pressed }) => [styles.modeCard, { backgroundColor: colors.card, borderColor: active ? colors.coral : colors.border, borderWidth: active ? 2 : 1, opacity: pressed ? 0.78 : 1 }]}><View style={[styles.modeIcon, { backgroundColor: active ? colors.accent : colors.secondary }]}><Feather name={icon} size={20} color={colors.foreground} /></View><View style={styles.modeCopy}><Text style={[styles.modeTitle, { color: colors.foreground }]}>{title}</Text><Text style={[styles.modeDescription, { color: colors.mutedForeground }]}>{description}</Text></View>{active ? <View style={[styles.check, { backgroundColor: colors.coral }]}><Feather name="check" size={14} color={colors.primaryForeground} /></View> : null}</Pressable>;
}

export default function SettingsScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mode, switchMode } = useNotes();
  const choose = async (nextMode: StorageMode) => { await switchMode(nextMode); };
  return <View style={[styles.screen, { backgroundColor: colors.background }]}>
    <View style={[styles.topBar, { paddingTop: insets.top + 8, borderBottomColor: colors.border }]}><Pressable testID="back-button" onPress={() => router.back()} style={styles.back}><Feather name="arrow-left" size={22} color={colors.foreground} /></Pressable><Text style={[styles.title, { color: colors.foreground }]}>Настройки</Text></View>
    <View style={styles.content}>
      <Text style={[styles.eyebrow, { color: colors.coral }]}>ПАРАМЕТРЫ ПРИЛОЖЕНИЯ</Text>
      <Text style={[styles.heading, { color: colors.foreground }]}>Где хранить заметки?</Text>
      <Text style={[styles.description, { color: colors.mutedForeground }]}>Выберите способ локального хранения. Данные остаются на этом устройстве и доступны без интернета.</Text>
      <ModeCard active={mode === 'sqlite'} icon="database" title="SQLite" description="Структурированная база данных для быстрого поиска и сортировки." onPress={() => void choose('sqlite')} />
      <ModeCard active={mode === 'files'} icon="file-text" title="Файлы устройства" description="Каждая заметка сохраняется отдельным JSON-файлом в папке приложения." onPress={() => void choose('files')} />
      <View style={[styles.infoCard, { backgroundColor: colors.secondary }]}><Feather name="shield" size={18} color={colors.foreground} /><View style={styles.infoCopy}><Text style={[styles.infoTitle, { color: colors.foreground }]}>Локально и безопасно</Text><Text style={[styles.infoText, { color: colors.mutedForeground }]}>Режим можно менять в любой момент. Записи каждого режима хранятся отдельно — переключение не удаляет данные.</Text></View></View>
      <Pressable testID="guide-link" onPress={() => router.push('/guide')} style={({ pressed }) => [styles.guideLink, { borderColor: colors.border, opacity: pressed ? 0.6 : 1 }]}><Feather name="book-open" size={17} color={colors.foreground} /><Text style={[styles.guideLinkText, { color: colors.foreground }]}>Открыть руководство по тестированию</Text><Feather name="chevron-right" size={17} color={colors.mutedForeground} /></Pressable>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: { paddingHorizontal: 18, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, gap: 12 },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  content: { padding: 20 },
  eyebrow: { fontSize: 11, letterSpacing: 1.3, fontFamily: 'Inter_700Bold', marginTop: 8, marginBottom: 8 },
  heading: { fontSize: 27, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  description: { fontSize: 14, lineHeight: 21, marginTop: 8, marginBottom: 25 },
  modeCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 18, padding: 15, marginBottom: 11 },
  modeIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  modeCopy: { flex: 1 },
  modeTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', marginBottom: 4 },
  modeDescription: { fontSize: 12, lineHeight: 17 },
  check: { width: 25, height: 25, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  infoCard: { flexDirection: 'row', borderRadius: 17, padding: 15, marginTop: 17, gap: 11, alignItems: 'flex-start' },
  infoCopy: { flex: 1 },
  infoTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold', marginBottom: 4 },
  infoText: { fontSize: 12, lineHeight: 18 },
  guideLink: { minHeight: 53, borderRadius: 16, borderWidth: 1, marginTop: 17, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', gap: 10 },
  guideLinkText: { flex: 1, fontSize: 13, fontFamily: 'Inter_600SemiBold' },
});