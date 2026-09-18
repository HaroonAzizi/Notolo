export interface ThemeColors {
  background: string;
  sheetBg: string;
  sidebarBg: string;
  toolbarBg: string;
  cardBg: string;
  activeItemBg: string;
  border: string;
  borderSubtle: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentSoft: string;
  accentHover: string;
  success: string;
  successSoft: string;
  warning: string;
  danger: string;
  dangerSoft: string;
  codeBg: string;
  codeText: string;
  quoteBorder: string;
  quoteBg: string;
  tableBorder: string;
  shadowColor: string;
  isDark: boolean;
}

export const darkTheme: ThemeColors = {
  background: '#0B0D11',
  sheetBg: '#13161C',
  sidebarBg: '#0F1116',
  toolbarBg: '#181C24',
  cardBg: '#161922',
  activeItemBg: '#202531',
  border: '#252B37',
  borderSubtle: '#1C212B',
  text: '#F3F4F6',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  accent: '#6366F1',
  accentSoft: 'rgba(99, 102, 241, 0.16)',
  accentHover: '#818CF8',
  success: '#10B981',
  successSoft: 'rgba(16, 185, 129, 0.16)',
  warning: '#F59E0B',
  danger: '#EF4444',
  dangerSoft: 'rgba(239, 68, 68, 0.16)',
  codeBg: '#08090C',
  codeText: '#CBD5E1',
  quoteBorder: '#6366F1',
  quoteBg: 'rgba(99, 102, 241, 0.08)',
  tableBorder: '#2E3544',
  shadowColor: '#000000',
  isDark: true,
};

export const lightTheme: ThemeColors = {
  background: '#F6F7F9',
  sheetBg: '#FFFFFF',
  sidebarBg: '#EEF1F5',
  toolbarBg: '#FFFFFF',
  cardBg: '#FFFFFF',
  activeItemBg: '#E0E7FF',
  border: '#E3E6EB',
  borderSubtle: '#EEF0F3',
  text: '#111827',
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',
  accent: '#4F46E5',
  accentSoft: 'rgba(79, 70, 229, 0.1)',
  accentHover: '#4338CA',
  success: '#059669',
  successSoft: 'rgba(5, 150, 105, 0.1)',
  warning: '#D97706',
  danger: '#DC2626',
  dangerSoft: 'rgba(220, 38, 38, 0.1)',
  codeBg: '#F3F4F6',
  codeText: '#1F2937',
  quoteBorder: '#4F46E5',
  quoteBg: 'rgba(79, 70, 229, 0.05)',
  tableBorder: '#E5E7EB',
  shadowColor: '#000000',
  isDark: false,
};
