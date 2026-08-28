import { StyleSheet } from 'react-native';

export const palette = { ink: '#17221B', muted: '#829087', line: '#E4E9E4', green: '#49A078', mint: '#E5F3EA', coral: '#E9785F', navy: '#1D3C4A', paper: '#F8FAF7' };

export const sharedStyles = StyleSheet.create({
  page: { flex: 1, paddingHorizontal: 22, paddingBottom: 100 },
  pageTitle: { color: palette.ink, fontSize: 28, fontWeight: '700' },
  pageSubtitle: { color: palette.muted, fontSize: 13, marginTop: 4, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: palette.ink, fontSize: 17, fontWeight: '700' },
  link: { color: palette.green, fontSize: 12, fontWeight: '700' },
  field: { color: palette.ink, backgroundColor: 'white', borderWidth: 1, borderColor: palette.line, borderRadius: 13, paddingHorizontal: 14, paddingVertical: 13, fontSize: 14 },
  inputLabel: { color: palette.muted, fontSize: 11, fontWeight: '700', marginBottom: 7, marginTop: 13 },
  saveButton: { backgroundColor: palette.green, borderRadius: 14, alignItems: 'center', paddingVertical: 15, marginTop: 24 },
  saveDisabled: { backgroundColor: '#B5C5BA' },
  saveText: { color: 'white', fontSize: 14, fontWeight: '700' },
});
