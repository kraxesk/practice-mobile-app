import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

const steps = [
  ['01', 'Создайте заметку', 'На главном экране нажмите «Новая заметка». Заполните заголовок, дату, время и содержание, затем нажмите «Сохранить».'],
  ['02', 'Найдите запись', 'Нажмите на значок поиска. Введите слово из заголовка или содержания, дату в формате ДД.ММ.ГГГГ или время.'],
  ['03', 'Измените заметку', 'Нажмите на любую карточку в списке. Исправьте нужные поля и сохраните изменения.'],
  ['04', 'Удалите запись', 'Нажмите на корзину в карточке и подтвердите действие в диалоге.'],
  ['05', 'Проверьте хранилище', 'Откройте настройки и переключитесь между SQLite и файлами устройства. Каждый режим хранит свой набор записей.'],
];

export default function GuideScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return <View style={[styles.screen, { backgroundColor: colors.background }]}>
    <View style={[styles.topBar, { paddingTop: insets.top + 8, borderBottomColor: colors.border }]}><Pressable testID="back-button" onPress={() => router.back()} style={styles.back}><Feather name="arrow-left" size={22} color={colors.foreground} /></Pressable><Text style={[styles.title, { color: colors.foreground }]}>Руководство</Text></View>
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 30 }}>
      <Text style={[styles.eyebrow, { color: colors.coral }]}>БЫСТРЫЙ СТАРТ</Text>
      <Text style={[styles.heading, { color: colors.foreground }]}>Как пользоваться</Text>
      <Text style={[styles.intro, { color: colors.mutedForeground }]}>Органайзер заметок помогает фиксировать решения и задачи во время деловых встреч.</Text>
      <View style={[styles.visual, { backgroundColor: colors.primary }]}><View style={[styles.visualPaper, { backgroundColor: colors.accent }]}><Feather name="file-text" size={27} color={colors.primary} /></View><View><Text style={[styles.visualTitle, { color: colors.primaryForeground }]}>Пять простых шагов</Text><Text style={[styles.visualSubtitle, { color: colors.primaryForeground }]}>от записи до поиска</Text></View></View>
      {steps.map(([number, title, text]) => <View key={number} style={styles.step}><View style={[styles.number, { backgroundColor: colors.secondary }]}><Text style={[styles.numberText, { color: colors.foreground }]}>{number}</Text></View><View style={styles.stepCopy}><Text style={[styles.stepTitle, { color: colors.foreground }]}>{title}</Text><Text style={[styles.stepText, { color: colors.mutedForeground }]}>{text}</Text></View></View>)}
      <View style={[styles.testCard, { borderColor: colors.border, backgroundColor: colors.card }]}><Feather name="check-circle" size={20} color={colors.sage} /><View style={styles.stepCopy}><Text style={[styles.stepTitle, { color: colors.foreground }]}>Проверка для руководителя</Text><Text style={[styles.stepText, { color: colors.mutedForeground }]}>Создайте две записи: «Совещание отдела» на 10:00 и «Конференция партнёров» на 14:30. Проверьте поиск по слову, дату, редактирование, удаление и оба режима хранения.</Text></View></View>
      <Text style={[styles.footer, { color: colors.mutedForeground }]}>Приложение работает локально на iOS и Android. Для демонстрации откройте превью или отсканируйте QR-код в Expo Go.</Text>
    </ScrollView>
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: { paddingHorizontal: 18, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, gap: 12 },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  eyebrow: { fontSize: 11, letterSpacing: 1.3, fontFamily: 'Inter_700Bold', marginTop: 8, marginBottom: 8 },
  heading: { fontSize: 29, fontFamily: 'Inter_700Bold', letterSpacing: -0.6 },
  intro: { fontSize: 14, lineHeight: 21, marginTop: 8, marginBottom: 21 },
  visual: { borderRadius: 21, padding: 19, flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 26 },
  visualPaper: { width: 55, height: 55, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  visualTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  visualSubtitle: { fontSize: 12, opacity: 0.65, marginTop: 4 },
  step: { flexDirection: 'row', gap: 14, marginBottom: 22 },
  number: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  numberText: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  stepCopy: { flex: 1 },
  stepTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', marginBottom: 5 },
  stepText: { fontSize: 13, lineHeight: 20 },
  testCard: { borderWidth: 1, borderRadius: 18, padding: 15, flexDirection: 'row', gap: 11, alignItems: 'flex-start', marginTop: 3 },
  footer: { fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 22, paddingHorizontal: 8 },
});