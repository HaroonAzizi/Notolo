import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  useWindowDimensions,
  SafeAreaView,
  StatusBar,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { useVaultStore } from './src/utils/vaultStore';
import { AppHeader } from './src/components/layout/AppHeader';
import { Sidebar } from './src/components/layout/Sidebar';
import { SmartEditor } from './src/components/editor/SmartEditor';
import { MarkdownViewer } from './src/components/preview/MarkdownViewer';
import { ExportModal } from './src/components/modals/ExportModal';

function MainApp() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768; // Standard iPad breakpoint

  const { theme } = useTheme();
  const {
    notes,
    activeNoteId,
    viewMode,
    isSidebarOpen,
    initVault,
    setSidebarOpen,
  } = useVaultStore();

  const [isExportOpen, setIsExportOpen] = useState(false);

  useEffect(() => {
    initVault();
  }, []);

  const activeNote = notes.find((n) => n.id === activeNoteId) || null;

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: theme.sidebarBg },
      ]}
    >
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.sidebarBg}
      />

      <View style={[styles.mainLayout, { backgroundColor: theme.background }]}>
        {/* Tablet Persistent/Collapsible Sidebar */}
        {isTablet && isSidebarOpen && (
          <View style={styles.tabletSidebar}>
            <Sidebar isTablet={true} />
          </View>
        )}

        {/* Mobile Slide-in Drawer Sidebar */}
        {!isTablet && (
          <Modal
            visible={isSidebarOpen}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => setSidebarOpen(false)}
          >
            <SafeAreaView
              style={[
                styles.mobileDrawer,
                { backgroundColor: theme.sidebarBg },
              ]}
            >
              <Sidebar
                isTablet={false}
                onCloseMobileDrawer={() => setSidebarOpen(false)}
              />
            </SafeAreaView>
          </Modal>
        )}

        {/* Content Canvas */}
        <View style={styles.contentArea}>
          <AppHeader
            isTablet={isTablet}
            onOpenExport={() => setIsExportOpen(true)}
          />

          {/* View Modes */}
          {viewMode === 'edit' && <SmartEditor isTablet={isTablet} />}

          {viewMode === 'preview' && <MarkdownViewer isTablet={isTablet} />}

          {viewMode === 'split' && isTablet && (
            <View style={styles.splitContainer}>
              <View
                style={[
                  styles.splitHalf,
                  { borderRightColor: theme.border, borderRightWidth: 1 },
                ]}
              >
                <SmartEditor isTablet={false} />
              </View>
              <View style={styles.splitHalf}>
                <MarkdownViewer isTablet={false} />
              </View>
            </View>
          )}

          {viewMode === 'split' && !isTablet && (
            // Mobile fallback if split selected: show editor
            <SmartEditor isTablet={false} />
          )}
        </View>
      </View>

      {/* Export Modal */}
      <ExportModal
        visible={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        note={activeNote}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  mainLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  tabletSidebar: {
    width: 290,
    height: '100%',
  },
  mobileDrawer: {
    flex: 1,
  },
  contentArea: {
    flex: 1,
    height: '100%',
  },
  splitContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  splitHalf: {
    flex: 1,
    height: '100%',
  },
});
