export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  tags: string[];
  isPinned: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Folder {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  createdAt: number;
}

export type ViewMode = 'edit' | 'split' | 'preview';

export type ThemeMode = 'system' | 'dark' | 'light';

export interface EditorSelection {
  start: number;
  end: number;
}

export type ExportFormat = 'markdown' | 'text' | 'pdf';

export interface DrawingPath {
  d: string;
  color: string;
  width: number;
}

export interface DrawingData {
  paths: DrawingPath[];
  width: number;
  height: number;
}
