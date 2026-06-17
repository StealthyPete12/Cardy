import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  Image,
  Modal,
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
import { LinearGradient } from 'expo-linear-gradient';
import Barcode from 'react-native-barcode-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.9;
const DISMISS_THRESHOLD = 150;

const FORMAT_MAP = {
  'EAN-13': 'EAN13',
  'EAN-8': 'EAN8',
  'UPC-A': 'UPC',
  'CODE128': 'CODE128',
  'CODE39': 'CODE39',
};

function formatExpiry(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function ExpandedCard({ card, visible, onClose }) {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
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
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
    backdropOpacity.value = withTiming(0, { duration: 250 }, () => {
      runOnJS(onClose)();
    });
  };

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

  const barcodeFormat = FORMAT_MAP[card.barcodeType] || card.barcodeType;

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <GestureHandlerRootView style={styles.root}>
        <View style={styles.overlay}>
          <Animated.View style={[styles.backdrop, backdropStyle]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={close} />
          </Animated.View>

          <GestureDetector gesture={panGesture}>
            <Animated.ScrollView
              style={[styles.scrollView, contentStyle]}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <View style={styles.dragHandle} />

              <View
                style={[
                  styles.expandedCard,
                  { borderRadius: card.cornerRadius || 20 },
                ]}
              >
                <LinearGradient
                  colors={[card.primaryColor, card.secondaryColor]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    StyleSheet.absoluteFill,
                    { borderRadius: card.cornerRadius || 20 },
                  ]}
                />
                <View style={styles.cardContent}>
                  <View style={styles.cardTopRow}>
                    <Image
                      source={{ uri: card.logoUrl }}
                      style={styles.logo}
                    />
                    <Text
                      style={[styles.storeName, { color: card.textColor }]}
                    >
                      {card.storeName}
                    </Text>
                  </View>
                  <Text style={[styles.cardNumber, { color: card.textColor }]}>
                    {card.cardNumber}
                  </Text>
                </View>
              </View>

              <View style={styles.barcodeContainer}>
                <Barcode
                  value={card.barcode}
                  format={barcodeFormat}
                  height={80}
                  lineColor="#000"
                  backgroundColor="#fff"
                  maxWidth={CARD_WIDTH - 64}
                  onError={() => {}}
                />
                <Text style={styles.barcodeText}>{card.barcode}</Text>
              </View>

              <View style={styles.detailsContainer}>
                {card.holderName ? (
                  <DetailRow label="Card Holder" value={card.holderName} />
                ) : null}
                {card.expiryDate ? (
                  <DetailRow
                    label="Expires"
                    value={formatExpiry(card.expiryDate)}
                  />
                ) : null}
                <DetailRow label="Card Number" value={card.cardNumber || card.barcode} />
                <DetailRow label="Type" value={card.barcodeType} />
              </View>
            </Animated.ScrollView>
          </GestureDetector>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 60,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginBottom: 24,
  },
  expandedCard: {
    width: CARD_WIDTH,
    height: 210,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  cardContent: {
    flex: 1,
    padding: 28,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 12,
    resizeMode: 'contain',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  storeName: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 2.5,
    opacity: 0.9,
  },
  barcodeContainer: {
    width: CARD_WIDTH,
    marginTop: 20,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  barcodeText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    letterSpacing: 3,
  },
  detailsContainer: {
    width: CARD_WIDTH,
    marginTop: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.5)',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
