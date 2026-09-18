import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TouchableWithoutFeedback,
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
  MoreVertical,
  X,
} from 'lucide-react-native';
import { useVaultStore } from '../../utils/vaultStore';
import { useTheme } from '../../theme/ThemeContext';
import { ViewMode } from '../../types';

interface Props {
  onOpenExport: () => void;
  isTablet: boolean;
}

export const AppHeader: React.FC<Props> = ({ onOpenExport, isTablet }) => {
  const { theme, toggleTheme } = useTheme();
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

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const activeNote = notes.find((n) => n.id === activeNoteId);

  const wordCount = activeNote
    ? activeNote.content.trim().split(/\s+/).filter(Boolean).length
    : 0;

  const handleDelete = () => {
    setIsMenuOpen(false);
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

  const handleTogglePin = () => {
    if (activeNote) togglePinNote(activeNote.id);
    setIsMenuOpen(false);
  };

  const handleOpenExport = () => {
    setIsMenuOpen(false);
    onOpenExport();
  };

  const handleToggleTheme = () => {
    toggleTheme();
    setIsMenuOpen(false);
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

      {/* Middle section: View Mode Switcher */}
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
            !isTablet && styles.modeButtonCompact,
            viewMode === 'edit' && {
              backgroundColor: theme.accentSoft,
            },
          ]}
        >
          <Edit3
            size={16}
            color={viewMode === 'edit' ? theme.accent : theme.textMuted}
          />
          {isTablet && (
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
          )}
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
              size={16}
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
            !isTablet && styles.modeButtonCompact,
            viewMode === 'preview' && {
              backgroundColor: theme.accentSoft,
            },
          ]}
        >
          <Eye
            size={16}
            color={viewMode === 'preview' ? theme.accent : theme.textMuted}
          />
          {isTablet && (
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
          )}
        </TouchableOpacity>
      </View>

      {/* Right section: Tablet (Direct icons) vs Mobile (Three Dots menu) */}
      {isTablet ? (
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
      ) : (
        <View style={styles.rightSectionCompact}>
          <TouchableOpacity
            onPress={() => setIsMenuOpen(true)}
            style={styles.iconButton}
          >
            <MoreVertical size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Mobile Overflow Actions Modal */}
      {!isTablet && (
        <Modal
          visible={isMenuOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsMenuOpen(false)}
        >
          <TouchableWithoutFeedback onPress={() => setIsMenuOpen(false)}>
            <View style={styles.menuOverlay}>
              <TouchableWithoutFeedback>
                <View
                  style={[
                    styles.menuCard,
                    {
                      backgroundColor: theme.cardBg,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <View style={styles.menuHeader}>
                    <Text
                      numberOfLines={1}
                      style={[styles.menuTitle, { color: theme.text }]}
                    >
                      {activeNote?.title || 'Note Actions'}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setIsMenuOpen(false)}
                      style={styles.menuCloseBtn}
                    >
                      <X size={18} color={theme.textMuted} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.menuList}>
                    {activeNote && (
                      <TouchableOpacity
                        onPress={handleTogglePin}
                        style={[
                          styles.menuItem,
                          { borderBottomColor: theme.borderSubtle },
                        ]}
                      >
                        <Pin
                          size={18}
                          color={activeNote.isPinned ? theme.accent : theme.text}
                          fill={activeNote.isPinned ? theme.accent : 'none'}
                          style={styles.menuItemIcon}
                        />
                        <Text style={[styles.menuItemText, { color: theme.text }]}>
                          {activeNote.isPinned ? 'Unpin Note' : 'Pin Note'}
                        </Text>
                      </TouchableOpacity>
                    )}

                    {activeNote && (
                      <TouchableOpacity
                        onPress={handleOpenExport}
                        style={[
                          styles.menuItem,
                          { borderBottomColor: theme.borderSubtle },
                        ]}
                      >
                        <Share2
                          size={18}
                          color={theme.text}
                          style={styles.menuItemIcon}
                        />
                        <Text style={[styles.menuItemText, { color: theme.text }]}>
                          Export & Share Note
                        </Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      onPress={handleToggleTheme}
                      style={[
                        styles.menuItem,
                        { borderBottomColor: theme.borderSubtle },
                      ]}
                    >
                      {theme.isDark ? (
                        <Sun
                          size={18}
                          color={theme.warning}
                          style={styles.menuItemIcon}
                        />
                      ) : (
                        <Moon
                          size={18}
                          color={theme.text}
                          style={styles.menuItemIcon}
                        />
                      )}
                      <Text style={[styles.menuItemText, { color: theme.text }]}>
                        {theme.isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                      </Text>
                    </TouchableOpacity>

                    {activeNote && (
                      <TouchableOpacity
                        onPress={handleDelete}
                        style={styles.menuItem}
                      >
                        <Trash2
                          size={18}
                          color={theme.danger}
                          style={styles.menuItemIcon}
                        />
                        <Text
                          style={[
                            styles.menuItemText,
                            { color: theme.danger, fontWeight: '600' },
                          ]}
                        >
                          Delete Note
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
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
    marginRight: 8,
  },
  titleWrapper: {
    marginLeft: 10,
    flex: 1,
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  wordCount: {
    fontSize: 11,
    marginTop: 1,
  },
  viewModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    padding: 2,
    marginRight: 6,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 6,
  },
  modeButtonCompact: {
    paddingHorizontal: 8,
    paddingVertical: 6,
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
  rightSectionCompact: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 14,
  },
  menuCard: {
    width: 220,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  menuCloseBtn: {
    padding: 2,
  },
  menuList: {
    paddingVertical: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuItemIcon: {
    marginRight: 10,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
