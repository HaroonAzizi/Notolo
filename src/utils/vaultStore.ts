import { create } from 'zustand';
import { Note, Folder, ViewMode, EditorSelection } from '../types';
import {
  loadInitialVault,
  saveNotesToStorage,
  saveFoldersToStorage,
  saveActiveNoteId,
} from './storage';
import { hapticFeedback } from './haptics';

interface VaultState {
  notes: Note[];
  folders: Folder[];
  activeNoteId: string;
  selectedFolderId: string;
  searchQuery: string;
  viewMode: ViewMode;
  isSidebarOpen: boolean;
  activeSelection: EditorSelection;
  isSaving: boolean;

  // Actions
  initVault: () => Promise<void>;
  setActiveNote: (id: string) => void;
  createNote: (folderId?: string) => string;
  updateActiveNoteContent: (content: string) => void;
  updateActiveNoteTitle: (title: string) => void;
  togglePinNote: (id: string) => void;
  deleteNote: (id: string) => void;
  setSelectedFolder: (folderId: string) => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveSelection: (selection: EditorSelection) => void;
  createFolder: (name: string, color?: string) => void;
  toggleChecklistInActiveNote: (lineIndex: number) => void;
}

export const useVaultStore = create<VaultState>((set, get) => ({
  notes: [],
  folders: [],
  activeNoteId: '',
  selectedFolderId: 'all',
  searchQuery: '',
  viewMode: 'edit',
  isSidebarOpen: true,
  activeSelection: { start: 0, end: 0 },
  isSaving: false,

  initVault: async () => {
    const { notes, folders, activeNoteId } = await loadInitialVault();
    set({ notes, folders, activeNoteId });
  },

  setActiveNote: (id: string) => {
    set({ activeNoteId: id });
    saveActiveNoteId(id);
    hapticFeedback.selection();
  },

  createNote: (folderId?: string) => {
    const state = get();
    const targetFolderId =
      folderId || (state.selectedFolderId !== 'all' ? state.selectedFolderId : 'work');

    const newNote: Note = {
      id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: 'Untitled Note',
      content: '# Untitled Note\n\nStart writing your thoughts...',
      folderId: targetFolderId,
      tags: [],
      isPinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updatedNotes = [newNote, ...state.notes];
    set({
      notes: updatedNotes,
      activeNoteId: newNote.id,
      viewMode: 'edit',
      activeSelection: { start: newNote.content.length, end: newNote.content.length },
    });

    saveNotesToStorage(updatedNotes);
    saveActiveNoteId(newNote.id);
    hapticFeedback.light();
    return newNote.id;
  },

  updateActiveNoteContent: (content: string) => {
    const { notes, activeNoteId } = get();
    if (!activeNoteId) return;

    // Extract title from first H1 if present
    let title = 'Untitled Note';
    const firstH1Match = content.match(/^#\s+(.+)$/m);
    if (firstH1Match && firstH1Match[1].trim()) {
      title = firstH1Match[1].trim();
    } else {
      const firstLine = content.split('\n').find((l) => l.trim().length > 0);
      if (firstLine) {
        title = firstLine.replace(/^[#\-*>]+\s*/, '').trim().slice(0, 40);
      }
    }

    const updatedNotes = notes.map((note) =>
      note.id === activeNoteId
        ? {
            ...note,
            content,
            title,
            updatedAt: Date.now(),
          }
        : note
    );

    set({ notes: updatedNotes });
    saveNotesToStorage(updatedNotes);
  },

  updateActiveNoteTitle: (title: string) => {
    const { notes, activeNoteId } = get();
    if (!activeNoteId) return;

    const updatedNotes = notes.map((note) =>
      note.id === activeNoteId
        ? {
            ...note,
            title,
            updatedAt: Date.now(),
          }
        : note
    );

    set({ notes: updatedNotes });
    saveNotesToStorage(updatedNotes);
  },

  togglePinNote: (id: string) => {
    const { notes } = get();
    const updatedNotes = notes.map((note) =>
      note.id === id ? { ...note, isPinned: !note.isPinned } : note
    );
    set({ notes: updatedNotes });
    saveNotesToStorage(updatedNotes);
    hapticFeedback.medium();
  },

  deleteNote: (id: string) => {
    const { notes, activeNoteId } = get();
    const updatedNotes = notes.filter((n) => n.id !== id);
    let nextActiveId = activeNoteId;
    if (activeNoteId === id) {
      nextActiveId = updatedNotes[0]?.id || '';
    }

    set({ notes: updatedNotes, activeNoteId: nextActiveId });
    saveNotesToStorage(updatedNotes);
    if (nextActiveId) saveActiveNoteId(nextActiveId);
    hapticFeedback.heavy();
  },

  setSelectedFolder: (folderId: string) => {
    set({ selectedFolderId: folderId });
    hapticFeedback.selection();
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  setViewMode: (mode: ViewMode) => {
    set({ viewMode: mode });
    hapticFeedback.light();
  },

  toggleSidebar: () => {
    set((s) => ({ isSidebarOpen: !s.isSidebarOpen }));
    hapticFeedback.light();
  },

  setSidebarOpen: (open: boolean) => {
    set({ isSidebarOpen: open });
  },

  setActiveSelection: (selection: EditorSelection) => {
    set({ activeSelection: selection });
  },

  createFolder: (name: string, color: string = '#6366F1') => {
    const { folders } = get();
    const newFolder: Folder = {
      id: `folder_${Date.now()}`,
      name,
      color,
      createdAt: Date.now(),
    };
    const updated = [...folders, newFolder];
    set({ folders: updated, selectedFolderId: newFolder.id });
    saveFoldersToStorage(updated);
    hapticFeedback.success();
  },

  toggleChecklistInActiveNote: (lineIndex: number) => {
    const { notes, activeNoteId } = get();
    const activeNote = notes.find((n) => n.id === activeNoteId);
    if (!activeNote) return;

    const lines = activeNote.content.split('\n');
    if (lineIndex < 0 || lineIndex >= lines.length) return;

    const targetLine = lines[lineIndex];
    let toggledLine = targetLine;

    if (targetLine.match(/^(\s*)-\s*\[ \]/)) {
      toggledLine = targetLine.replace(/^(\s*)-\s*\[ \]/, '$1- [x]');
    } else if (targetLine.match(/^(\s*)-\s*\[[xX]\]/)) {
      toggledLine = targetLine.replace(/^(\s*)-\s*\[[xX]\]/, '$1- [ ]');
    }

    if (toggledLine !== targetLine) {
      lines[lineIndex] = toggledLine;
      const updatedContent = lines.join('\n');
      const updatedNotes = notes.map((n) =>
        n.id === activeNoteId
          ? { ...n, content: updatedContent, updatedAt: Date.now() }
          : n
      );
      set({ notes: updatedNotes });
      saveNotesToStorage(updatedNotes);
      hapticFeedback.medium();
    }
  },
}));
