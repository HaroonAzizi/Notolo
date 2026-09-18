import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Pin } from 'lucide-react-native';
import { Note } from '../../types';
import { useTheme } from '../../theme/ThemeContext';

interface Props {
  note: Note;
  isActive: boolean;
  onSelect: () => void;
  onTogglePin: () => void;
}

export const NoteListItem: React.FC<Props> = ({
  note,
  isActive,
  onSelect,
}) => {
  const { theme } = useTheme();

  // Create preview snippet without markdown formatting tags
  const previewText = note.content
    .split('\n')
    .slice(1) // skip title
    .join(' ')
    .replace(/[#*`_~>\-[\]]/g, '')
    .trim()
    .slice(0, 75);

  // Force Gregorian date formatting
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    calendar: 'gregory',
  }).format(new Date(note.updatedAt));

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onSelect}
      style={[
        styles.container,
        {
          backgroundColor: isActive ? theme.activeItemBg : 'transparent',
          borderColor: isActive ? theme.accent : 'transparent',
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          {note.isPinned && (
            <Pin size={12} color={theme.accent} style={styles.pinIcon} />
          )}
          <Text
            numberOfLines={1}
            style={[
              styles.title,
              {
                color: isActive ? theme.accent : theme.text,
                fontWeight: isActive ? '700' : '600',
              },
            ]}
          >
            {note.title || 'Untitled'}
          </Text>
        </View>
        <Text style={[styles.date, { color: theme.textMuted }]}>{formattedDate}</Text>
      </View>

      <Text
        numberOfLines={2}
        style={[styles.preview, { color: theme.textSecondary }]}
      >
        {previewText || 'No additional text'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 4,
    borderWidth: 1.5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  pinIcon: {
    marginRight: 6,
  },
  title: {
    fontSize: 15,
    letterSpacing: -0.2,
  },
  date: {
    fontSize: 12,
  },
  preview: {
    fontSize: 13,
    lineHeight: 18,
  },
});
