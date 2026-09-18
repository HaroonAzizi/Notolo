import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note, Folder } from '../types';

const NOTES_KEY = '@notolo_vault_notes_v1';
const FOLDERS_KEY = '@notolo_vault_folders_v1';
const ACTIVE_NOTE_KEY = '@notolo_active_note_id';

const WELCOME_NOTE_CONTENT = `# Welcome to Notolo 🖋️

**Notolo** is an ultra-fast, minimalist note-taking app blending the best of **Obsidian** (local-first Markdown vault, folder & tag organization, fast search) with **Google Docs** (effortless formatting ribbon, document canvas, auto-formatting).

---

## ⚡ Key Highlights
- **Lightning Fast**: Pure native performance engineered for iPadOS 16 & iOS.
- **Zero Account Required**: 100% offline, private, and stored directly on your device.
- **Auto-Formatting**:
  - Type \`# \`, \`## \`, \`### \` for instant Headings.
  - Type \`- \` or \`* \` for smart Bullet Lists.
  - Type \`1. \` for Numbered Lists.
  - Type \`- [ ] \` for interactive Checklists.
  - Press \`Enter\` to auto-continue any list, and press \`Enter\` again to exit!
- **Interactive Checklists**: In Preview mode, tap checkboxes directly to check them off!

---

## 📋 Interactive Task Checklist
- [x] Create first note with Notolo
- [ ] Try the Google Docs formatting ribbon above the keyboard
- [ ] Toggle between Edit, Split View, and Reader modes
- [ ] Export note as Markdown or PDF
- [ ] Connect external keyboard on iPad for quick formatting

---

## 💻 Code & Tables
\`\`\`typescript
interface Note {
  title: string;
  isObsidianFast: true;
  isGoogleDocsClean: true;
}
\`\`\`

| Feature | Notolo | Standard Apps |
| :--- | :--- | :--- |
| Local Markdown | ✅ Yes | ❌ Cloud Locked |
| Auto-Formatting | ✅ Built-in | ❌ Limited |
| iPadOS Split View | ✅ Optimized | ⚠️ Slow |

> *"Simplicity is about subtracting the obvious and adding the meaningful."* — John Maeda

Happy writing with Notolo!`;

const DEFAULT_FOLDERS: Folder[] = [
  { id: 'all', name: 'All Notes', icon: 'file-text', createdAt: Date.now() },
  { id: 'work', name: 'Work & Projects', icon: 'briefcase', color: '#6366F1', createdAt: Date.now() },
  { id: 'personal', name: 'Personal & Ideas', icon: 'sparkles', color: '#10B981', createdAt: Date.now() },
  { id: 'archive', name: 'Archive', icon: 'archive', color: '#6B7280', createdAt: Date.now() },
];

export async function loadInitialVault(): Promise<{
  notes: Note[];
  folders: Folder[];
  activeNoteId: string;
}> {
  try {
    const [notesRaw, foldersRaw, activeIdRaw] = await Promise.all([
      AsyncStorage.getItem(NOTES_KEY),
      AsyncStorage.getItem(FOLDERS_KEY),
      AsyncStorage.getItem(ACTIVE_NOTE_KEY),
    ]);

    let notes: Note[] = notesRaw ? JSON.parse(notesRaw) : [];
    let folders: Folder[] = foldersRaw ? JSON.parse(foldersRaw) : DEFAULT_FOLDERS;

    if (notes.length === 0) {
      const welcomeNote: Note = {
        id: 'welcome-note-1',
        title: 'Welcome to Notolo 🖋️',
        content: WELCOME_NOTE_CONTENT,
        folderId: 'work',
        tags: ['welcome', 'guide', 'markdown'],
        isPinned: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      notes = [welcomeNote];
      await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    }

    if (!foldersRaw) {
      await AsyncStorage.setItem(FOLDERS_KEY, JSON.stringify(DEFAULT_FOLDERS));
    }

    let activeNoteId = activeIdRaw;
    if (!activeNoteId || !notes.find((n) => n.id === activeNoteId)) {
      activeNoteId = notes[0]?.id || '';
    }

    return { notes, folders, activeNoteId };
  } catch (error) {
    console.error('Error loading vault:', error);
    return {
      notes: [],
      folders: DEFAULT_FOLDERS,
      activeNoteId: '',
    };
  }
}

export async function saveNotesToStorage(notes: Note[]): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('Error saving notes:', error);
  }
}

export async function saveFoldersToStorage(folders: Folder[]): Promise<void> {
  try {
    await AsyncStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
  } catch (error) {
    console.error('Error saving folders:', error);
  }
}

export async function saveActiveNoteId(id: string): Promise<void> {
  try {
    await AsyncStorage.setItem(ACTIVE_NOTE_KEY, id);
  } catch {
    // ignore
  }
}
