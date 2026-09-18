import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import {
  Search,
  Plus,
  Folder as FolderIcon,
  Briefcase,
  Sparkles,
  Archive,
  BookOpen,
  X,
} from 'lucide-react-native';
import { useVaultStore } from '../../utils/vaultStore';
import { useTheme } from '../../theme/ThemeContext';
import { NoteListItem } from './NoteListItem';
import { Folder } from '../../types';

const FOLDER_ICONS: Record<string, any> = {
  all: BookOpen,
  work: Briefcase,
  personal: Sparkles,
  archive: Archive,
};

interface Props {
  onCloseMobileDrawer?: () => void;
  isTablet: boolean;
}

export const Sidebar: React.FC<Props> = ({ onCloseMobileDrawer, isTablet }) => {
  const { theme } = useTheme();
  const {
    notes,
    folders,
    activeNoteId,
    selectedFolderId,
    searchQuery,
    setActiveNote,
    createNote,
    togglePinNote,
    setSelectedFolder,
    setSearchQuery,
  } = useVaultStore();

  const [isSearching, setIsSearching] = useState(false);

  // Filter notes by selected folder and search query
  const filteredNotes = notes.filter((note) => {
    const matchesFolder =
      selectedFolderId === 'all' || note.folderId === selectedFolderId;
    if (!matchesFolder) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(q) ||
      note.content.toLowerCase().includes(q) ||
      note.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  // Sort pinned notes to the top, then by most recently updated
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.updatedAt - a.updatedAt;
  });

  const handleSelectNote = (id: string) => {
    setActiveNote(id);
    if (!isTablet && onCloseMobileDrawer) {
      onCloseMobileDrawer();
    }
  };

  const handleCreateNew = () => {
    createNote();
    if (!isTablet && onCloseMobileDrawer) {
      onCloseMobileDrawer();
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.sidebarBg,
          borderRightColor: theme.border,
        },
      ]}
    >
      {/* Brand Header */}
      <View style={styles.brandHeader}>
        <View style={styles.brandLeft}>
          <Image
            source={require('../../../assets/icon.png')}
            style={styles.brandLogo}
          />
          <View>
            <Text style={[styles.brandTitle, { color: theme.text }]}>Notolo</Text>
            <Text style={[styles.brandSubtitle, { color: theme.textMuted }]}>
              Obsidian & Docs
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleCreateNew}
          style={[styles.newNoteBtn, { backgroundColor: theme.accent }]}
          activeOpacity={0.8}
        >
          <Plus size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: theme.cardBg,
            borderColor: isSearching ? theme.accent : theme.border,
          },
        ]}
      >
        <Search size={16} color={theme.textMuted} style={styles.searchIcon} />
        <TextInput
          placeholder="Search notes, tags..."
          placeholderTextColor={theme.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setIsSearching(true)}
          onBlur={() => setIsSearching(false)}
          style={[styles.searchInput, { color: theme.text }]}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X size={14} color={theme.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Folders horizontal or pill list */}
      <View style={styles.foldersSection}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={folders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.foldersList}
          renderItem={({ item }) => {
            const IconComponent = FOLDER_ICONS[item.id] || FolderIcon;
            const isSelected = selectedFolderId === item.id;
            const count =
              item.id === 'all'
                ? notes.length
                : notes.filter((n) => n.folderId === item.id).length;

            return (
              <TouchableOpacity
                onPress={() => setSelectedFolder(item.id)}
                activeOpacity={0.7}
                style={[
                  styles.folderChip,
                  {
                    backgroundColor: isSelected
                      ? theme.accentSoft
                      : theme.cardBg,
                    borderColor: isSelected ? theme.accent : theme.border,
                  },
                ]}
              >
                <IconComponent
                  size={14}
                  color={isSelected ? theme.accent : theme.textSecondary}
                  style={styles.folderChipIcon}
                />
                <Text
                  style={[
                    styles.folderChipText,
                    {
                      color: isSelected ? theme.accent : theme.textSecondary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {item.name}
                </Text>
                <Text
                  style={[
                    styles.folderChipCount,
                    {
                      color: isSelected ? theme.accent : theme.textMuted,
                    },
                  ]}
                >
                  {count}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Notes List */}
      <View style={styles.notesListHeader}>
        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
          {searchQuery ? 'SEARCH RESULTS' : 'NOTES'} ({sortedNotes.length})
        </Text>
      </View>

      <FlatList
        data={sortedNotes}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.notesListContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              {searchQuery ? 'No notes match your search' : 'No notes in this folder'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <NoteListItem
            note={item}
            isActive={item.id === activeNoteId}
            onSelect={() => handleSelectNote(item.id)}
            onTogglePin={() => togglePinNote(item.id)}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRightWidth: 1,
    paddingTop: 12,
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  brandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    marginRight: 10,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  newNoteBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
    padding: 0,
  },
  foldersSection: {
    marginBottom: 12,
  },
  foldersList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  folderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  folderChipIcon: {
    marginRight: 6,
  },
  folderChipText: {
    fontSize: 12,
    marginRight: 6,
  },
  folderChipCount: {
    fontSize: 11,
    fontWeight: '600',
  },
  notesListHeader: {
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  notesListContent: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  emptyContainer: {
    paddingTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
});
