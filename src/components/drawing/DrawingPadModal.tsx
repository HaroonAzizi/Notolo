import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  PanResponder,
  useWindowDimensions,
  SafeAreaView,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import {
  X,
  Check,
  RotateCcw,
  Trash2,
  PenTool,
  Eraser,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { DrawingData, DrawingPath } from '../../types';
import { hapticFeedback } from '../../utils/haptics';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (drawing: DrawingData) => void;
  initialData?: DrawingData | null;
}

const PALETTE = [
  '#00E5BC', // Electric Cyan (Theme)
  '#10B981', // Mint Emerald
  '#FBBF24', // Amber Gold
  '#F87171', // Coral Red
  '#A78BFA', // Lavender
  '#F0FDF4', // Crisp White
];

const STROKE_WIDTHS = [
  { label: 'Fine', value: 2.5 },
  { label: 'Medium', value: 5 },
  { label: 'Broad', value: 10 },
];

export const DrawingPadModal: React.FC<Props> = ({
  visible,
  onClose,
  onSave,
  initialData,
}) => {
  const { width, height } = useWindowDimensions();
  const { theme } = useTheme();

  const canvasWidth = Math.min(width - 32, 780);
  const canvasHeight = Math.min(height - 180, 520);

  const [paths, setPaths] = useState<DrawingPath[]>(initialData?.paths || []);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>('#00E5BC');
  const [selectedWidth, setSelectedWidth] = useState<number>(3);
  const [isEraser, setIsEraser] = useState<boolean>(false);

  // Sync initialData when opening
  React.useEffect(() => {
    if (visible) {
      setPaths(initialData?.paths || []);
      setCurrentPoints([]);
    }
  }, [visible, initialData]);

  const activeColor = isEraser ? theme.sheetBg : selectedColor;
  const activeWidth = isEraser ? selectedWidth * 3 : selectedWidth;

  const pointsToSvgPath = (points: { x: number; y: number }[]): string => {
    if (points.length === 0) return '';
    if (points.length === 1) {
      return `M ${points[0].x} ${points[0].y} L ${points[0].x + 0.1} ${points[0].y + 0.1}`;
    }

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const midX = (prev.x + curr.x) / 2;
      const midY = (prev.y + curr.y) / 2;
      d += ` Q ${prev.x} ${prev.y}, ${midX} ${midY}`;
    }
    return d;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPoints([{ x: locationX, y: locationY }]);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPoints((prev) => [...prev, { x: locationX, y: locationY }]);
      },
      onPanResponderRelease: () => {
        setCurrentPoints((pts) => {
          if (pts.length > 0) {
            const newPath: DrawingPath = {
              d: pointsToSvgPath(pts),
              color: activeColor,
              width: activeWidth,
            };
            setPaths((prev) => [...prev, newPath]);
          }
          return [];
        });
      },
    })
  ).current;

  const handleUndo = () => {
    hapticFeedback.light();
    setPaths((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    hapticFeedback.medium();
    setPaths([]);
    setCurrentPoints([]);
  };

  const handleDone = () => {
    hapticFeedback.success();
    onSave({
      paths,
      width: canvasWidth,
      height: canvasHeight,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: theme.toolbarBg,
              borderBottomColor: theme.border,
            },
          ]}
        >
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <X size={22} color={theme.text} />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <PenTool size={18} color={theme.accent} style={{ marginRight: 6 }} />
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              Stylus Sketch Pad
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleDone}
            style={[styles.insertBtn, { backgroundColor: theme.accent }]}
          >
            <Check size={18} color="#071015" strokeWidth={2.5} />
            <Text style={styles.insertBtnText}>Insert</Text>
          </TouchableOpacity>
        </View>

        {/* Toolbar: Colors, Widths, Eraser, Undo */}
        <View
          style={[
            styles.toolbar,
            {
              backgroundColor: theme.toolbarBg,
              borderBottomColor: theme.border,
            },
          ]}
        >
          {/* Colors */}
          <View style={styles.colorRow}>
            {PALETTE.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => {
                  setSelectedColor(c);
                  setIsEraser(false);
                  hapticFeedback.selection();
                }}
                style={[
                  styles.colorChip,
                  { backgroundColor: c },
                  selectedColor === c &&
                    !isEraser && [
                      styles.selectedColorChip,
                      { borderColor: theme.accent },
                    ],
                ]}
              />
            ))}

            <TouchableOpacity
              onPress={() => {
                setIsEraser((prev) => !prev);
                hapticFeedback.light();
              }}
              style={[
                styles.toolIconBtn,
                isEraser && {
                  backgroundColor: theme.accentSoft,
                },
              ]}
            >
              <Eraser
                size={18}
                color={isEraser ? theme.accent : theme.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Widths & Actions */}
          <View style={styles.actionRow}>
            {STROKE_WIDTHS.map((sw) => (
              <TouchableOpacity
                key={sw.label}
                onPress={() => {
                  setSelectedWidth(sw.value);
                  hapticFeedback.selection();
                }}
                style={[
                  styles.widthBtn,
                  selectedWidth === sw.value && {
                    backgroundColor: theme.accentSoft,
                  },
                ]}
              >
                <View
                  style={[
                    styles.widthDot,
                    {
                      width: sw.value * 2,
                      height: sw.value * 2,
                      borderRadius: sw.value,
                      backgroundColor: theme.text,
                    },
                  ]}
                />
              </TouchableOpacity>
            ))}

            <View style={[styles.vDivider, { backgroundColor: theme.border }]} />

            <TouchableOpacity
              onPress={handleUndo}
              disabled={paths.length === 0}
              style={[
                styles.toolIconBtn,
                paths.length === 0 && { opacity: 0.35 },
              ]}
            >
              <RotateCcw size={18} color={theme.text} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleClear}
              disabled={paths.length === 0}
              style={[
                styles.toolIconBtn,
                paths.length === 0 && { opacity: 0.35 },
              ]}
            >
              <Trash2 size={18} color={theme.danger} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Canvas Area */}
        <View style={styles.canvasWrapper}>
          <View
            style={[
              styles.canvasBox,
              {
                width: canvasWidth,
                height: canvasHeight,
                backgroundColor: theme.sheetBg,
                borderColor: theme.border,
              },
            ]}
            {...panResponder.panHandlers}
          >
            <Svg width={canvasWidth} height={canvasHeight}>
              {paths.map((p, idx) => (
                <Path
                  key={idx}
                  d={p.d}
                  stroke={p.color}
                  strokeWidth={p.width}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              {currentPoints.length > 0 && (
                <Path
                  d={pointsToSvgPath(currentPoints)}
                  stroke={activeColor}
                  strokeWidth={activeWidth}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </Svg>
          </View>
          <Text style={[styles.canvasHint, { color: theme.textMuted }]}>
            Draw or write with your Apple Pencil or Stylus • Vector crisp rendering
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerBtn: {
    padding: 6,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  insertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 4,
  },
  insertBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#071015',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    flexWrap: 'wrap',
    gap: 10,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorChip: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  selectedColorChip: {
    borderWidth: 2.5,
    transform: [{ scale: 1.15 }],
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  widthBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  widthDot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vDivider: {
    width: 1,
    height: 20,
    marginHorizontal: 4,
  },
  canvasWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  canvasBox: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  canvasHint: {
    marginTop: 14,
    fontSize: 12,
    letterSpacing: 0.2,
  },
});
