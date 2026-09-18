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
  background: '#071015',
  sheetBg: '#0D1C24',
  sidebarBg: '#09151D',
  toolbarBg: '#0E1F29',
  cardBg: '#122430',
  activeItemBg: '#183343',
  border: '#1E3A4B',
  borderSubtle: '#142834',
  text: '#F0FDF4',
  textSecondary: '#8FAAB8',
  textMuted: '#5A7382',
  accent: '#00E5BC',
  accentSoft: 'rgba(0, 229, 188, 0.14)',
  accentHover: '#2DD4BF',
  success: '#10B981',
  successSoft: 'rgba(16, 185, 129, 0.14)',
  warning: '#FBBF24',
  danger: '#F87171',
  dangerSoft: 'rgba(248, 113, 113, 0.14)',
  codeBg: '#050D11',
  codeText: '#A7F3D0',
  quoteBorder: '#00E5BC',
  quoteBg: 'rgba(0, 229, 188, 0.08)',
  tableBorder: '#1E3A4B',
  shadowColor: '#02070A',
  isDark: true,
};

export const lightTheme: ThemeColors = {
  background: '#F0F6F5',
  sheetBg: '#FFFFFF',
  sidebarBg: '#E7EFEB',
  toolbarBg: '#FFFFFF',
  cardBg: '#FFFFFF',
  activeItemBg: '#CCFBF1',
  border: '#D1E0DC',
  borderSubtle: '#E2ECE9',
  text: '#0F2422',
  textSecondary: '#3D5C58',
  textMuted: '#708F8B',
  accent: '#0D9488',
  accentSoft: 'rgba(13, 148, 136, 0.12)',
  accentHover: '#0F766E',
  success: '#059669',
  successSoft: 'rgba(5, 150, 105, 0.1)',
  warning: '#D97706',
  danger: '#DC2626',
  dangerSoft: 'rgba(220, 38, 38, 0.1)',
  codeBg: '#E6F4F1',
  codeText: '#0F766E',
  quoteBorder: '#0D9488',
  quoteBg: 'rgba(13, 148, 136, 0.06)',
  tableBorder: '#D1E0DC',
  shadowColor: '#000000',
  isDark: false,
};
