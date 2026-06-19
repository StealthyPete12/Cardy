import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  Image,
  Modal,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import BarcodeText from './BarcodeText';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_INSET = 32;
const CARD_WIDTH = SCREEN_WIDTH - CARD_INSET * 2;
const EXPANDED_CARD_HEIGHT = SCREEN_HEIGHT * 0.75;
const DISMISS_THRESHOLD = 150; // How far to drag down before the card dismisses

// Full-screen card overlay — shows card details, barcode, and delete option
// Can be dismissed by tapping "Done", swiping down, or tapping the backdrop
export default function ExpandedCard({ card, visible, onClose, onDelete, onCloseStart }) {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    if (visible) {
      setLogoError(false);
      translateY.value = withSpring(0, {
        damping: 22,
        stiffness: 200,
        mass: 0.8,
      });
      backdropOpacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = SCREEN_HEIGHT;
      backdropOpacity.value = 0;
    }
  }, [visible]);

  const close = () => {
    if (onCloseStart) onCloseStart();
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
    backdropOpacity.value = withTiming(0, { duration: 250 }, () => {
      runOnJS(onClose)();
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Remove Card',
      `Remove ${card.storeName} from your wallet?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const cardId = card.id;
            if (onCloseStart) onCloseStart();
            translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
            backdropOpacity.value = withTiming(0, { duration: 250 }, () => {
              runOnJS(onClose)();
            });
            setTimeout(() => {
              if (onDelete) onDelete(cardId);
            }, 350);
          },
        },
      ]
    );
  };

  // Swipe down to dismiss — only tracks downward movement
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
        backdropOpacity.value = interpolate(
          event.translationY,
          [0, SCREEN_HEIGHT * 0.4],
          [1, 0.2]
        );
      }
    })
    .onEnd((event) => {
      if (event.translationY > DISMISS_THRESHOLD || event.velocityY > 500) {
        runOnJS(close)();
      } else {
        translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
        backdropOpacity.value = withSpring(1);
      }
    });

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!card) return null;

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <GestureHandlerRootView style={styles.root}>
        <View style={styles.overlay}>
          <Animated.View style={[styles.backdrop, backdropStyle]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={close} />
          </Animated.View>

          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.fullScreen, contentStyle]}>
              <Svg style={StyleSheet.absoluteFill}>
                <Defs>
                  <LinearGradient id="expandedGrad" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0" stopColor={card.primaryColor} />
                    <Stop offset="1" stopColor={card.secondaryColor} />
                  </LinearGradient>
                </Defs>
                <Rect width="100%" height="100%" fill="url(#expandedGrad)" />
              </Svg>
              <View style={styles.safeContent}>
                <View style={styles.topBar}>
                  <View style={styles.dragHandleWrap}>
                    <View style={styles.dragHandle} />
                  </View>
                  <Pressable onPress={close} style={styles.closeButton}>
                    <Text style={styles.closeText}>Done</Text>
                  </Pressable>
                </View>

                <View style={styles.cardInfo}>
                  {card.logoUrl && !logoError ? (
                    <Image
                      source={{ uri: card.logoUrl }}
                      style={styles.logo}
                      onError={() => setLogoError(true)}
                    />
                  ) : (
                    <View style={styles.logoFallback}>
                      <Text
                        style={[
                          styles.logoInitial,
                          { color: card.textColor },
                        ]}
                      >
                        {(card.storeName || '?')[0].toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <Text style={[styles.storeName, { color: card.textColor }]}>
                    {card.storeName}
                  </Text>
                  <Text style={[styles.cardNumber, { color: card.textColor }]}>
                    {card.cardNumber}
                  </Text>
                </View>

                <View style={styles.barcodeSection}>
                  <View style={styles.barcodeCard}>
                    <BarcodeText value={card.barcode || card.cardNumber || '0000000000'} />
                  </View>
                </View>

                <Pressable onPress={handleDelete} style={styles.deleteButton}>
                  <Text style={styles.deleteText}>Remove Card</Text>
                </Pressable>
              </View>
            </Animated.View>
          </GestureDetector>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  overlay: { flex: 1 },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  fullScreen: {
    height: EXPANDED_CARD_HEIGHT,
    marginTop: CARD_INSET,
    marginHorizontal: CARD_INSET,
    borderRadius: 24,
    overflow: 'hidden',
  },
  safeContent: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  dragHandleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  closeText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  cardInfo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    resizeMode: 'contain',
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 8,
  },
  logoFallback: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoInitial: {
    fontSize: 28,
    fontWeight: '700',
  },
  storeName: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  cardNumber: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 2.5,
    opacity: 0.85,
    textAlign: 'center',
  },
  barcodeSection: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  barcodeCard: {
    width: CARD_WIDTH - 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  deleteButton: {
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingVertical: 14,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,59,48,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.3)',
  },
  deleteText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
});
