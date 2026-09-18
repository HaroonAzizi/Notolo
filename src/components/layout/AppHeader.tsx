import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  PanelLeft,
  Edit3,
  Columns,
  Eye,
  Share2,
  Pin,
  Trash2,
  Moon,
  Sun,
} from 'lucide-react-native';
import { useVaultStore } from '../../utils/vaultStore';
import { useTheme } from '../../theme/ThemeContext';
import { ViewMode } from '../../types';

interface Props {
  onOpenExport: () => void;
  isTablet: boolean;
}

export const AppHeader: React.FC<Props> = ({ onOpenExport, isTablet }) => {
  const { theme, toggleTheme, themeMode } = useTheme();
  const {
    notes,
    activeNoteId,
    viewMode,
    isSidebarOpen,
    setViewMode,
    toggleSidebar,
    togglePinNote,
    deleteNote,
  } = useVaultStore();

  const activeNote = notes.find((n) => n.id === activeNoteId);

  // Calculate word count and character count
  const wordCount = activeNote
    ? activeNote.content.trim().split(/\s+/).filter(Boolean).length
    : 0;

  const handleDelete = () => {
    if (!activeNote) return;
    Alert.alert(
      'Delete Note',
      `Are you sure you want to delete "${activeNote.title || 'Untitled'}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteNote(activeNote.id),
        },
      ]
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.toolbarBg,
          borderBottomColor: theme.border,
        },
      ]}
    >
      {/* Left section: Sidebar toggle & Title */}
      <View style={styles.leftSection}>
        <TouchableOpacity
          onPress={toggleSidebar}
          activeOpacity={0.7}
          style={[
            styles.iconButton,
            {
              backgroundColor: isSidebarOpen ? theme.accentSoft : 'transparent',
            },
          ]}
        >
          <PanelLeft
            size={20}
            color={isSidebarOpen ? theme.accent : theme.textSecondary}
          />
        </TouchableOpacity>

        {activeNote && (
          <View style={styles.titleWrapper}>
            <Text
              numberOfLines={1}
              style={[styles.noteTitle, { color: theme.text }]}
            >
              {activeNote.title || 'Untitled'}
            </Text>
            <Text style={[styles.wordCount, { color: theme.textMuted }]}>
              {wordCount} words
            </Text>
          </View>
        )}
      </View>

      {/* Middle section: View Mode Switcher (Edit | Split | Preview) */}
      <View
        style={[
          styles.viewModeContainer,
          {
            backgroundColor: theme.cardBg,
            borderColor: theme.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => setViewMode('edit')}
          style={[
            styles.modeButton,
            viewMode === 'edit' && {
              backgroundColor: theme.accentSoft,
            },
          ]}
        >
          <Edit3
            size={15}
            color={viewMode === 'edit' ? theme.accent : theme.textMuted}
          />
          <Text
            style={[
              styles.modeButtonText,
              {
                color: viewMode === 'edit' ? theme.accent : theme.textMuted,
                fontWeight: viewMode === 'edit' ? '700' : '500',
              },
            ]}
          >
            Edit
          </Text>
        </TouchableOpacity>

        {isTablet && (
          <TouchableOpacity
            onPress={() => setViewMode('split')}
            style={[
              styles.modeButton,
              viewMode === 'split' && {
                backgroundColor: theme.accentSoft,
              },
            ]}
          >
            <Columns
              size={15}
              color={viewMode === 'split' ? theme.accent : theme.textMuted}
            />
            <Text
              style={[
                styles.modeButtonText,
                {
                  color: viewMode === 'split' ? theme.accent : theme.textMuted,
                  fontWeight: viewMode === 'split' ? '700' : '500',
                },
              ]}
            >
              Split
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => setViewMode('preview')}
          style={[
            styles.modeButton,
            viewMode === 'preview' && {
              backgroundColor: theme.accentSoft,
            },
          ]}
        >
          <Eye
            size={15}
            color={viewMode === 'preview' ? theme.accent : theme.textMuted}
          />
          <Text
            style={[
              styles.modeButtonText,
              {
                color: viewMode === 'preview' ? theme.accent : theme.textMuted,
                fontWeight: viewMode === 'preview' ? '700' : '500',
              },
            ]}
          >
            Read
          </Text>
        </TouchableOpacity>
      </View>

      {/* Right section: Actions */}
      <View style={styles.rightSection}>
        {activeNote && (
          <>
            <TouchableOpacity
              onPress={() => togglePinNote(activeNote.id)}
              style={styles.iconButton}
            >
              <Pin
                size={18}
                color={activeNote.isPinned ? theme.accent : theme.textMuted}
                fill={activeNote.isPinned ? theme.accent : 'none'}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={onOpenExport} style={styles.iconButton}>
              <Share2 size={18} color={theme.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
              <Trash2 size={18} color={theme.danger} />
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity onPress={toggleTheme} style={styles.iconButton}>
          {theme.isDark ? (
            <Sun size={18} color={theme.warning} />
          ) : (
            <Moon size={18} color={theme.textSecondary} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleWrapper: {
    marginLeft: 10,
    flexShrink: 1,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  wordCount: {
    fontSize: 11,
  },
  viewModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    padding: 2,
    marginHorizontal: 8,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 6,
  },
  modeButtonText: {
    fontSize: 12,
    marginLeft: 5,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
