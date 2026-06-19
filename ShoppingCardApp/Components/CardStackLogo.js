import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, AccessibilityInfo } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CARD_WIDTH = SCREEN_WIDTH * 0.38;
const CARD_HEIGHT = CARD_WIDTH * 1.55;
const BORDER_WIDTH = 2.5;

// Three decorative cards fanned out behind the "Cardy" brand name
const CARDS = [
  { color: '#1565C0', rotation: -14 },
  { color: '#2E7D32', rotation: 0 },
  { color: '#F57C00', rotation: 14 },
];

const SPRING_CONFIG = {
  damping: 14,
  stiffness: 80,
  mass: 0.8,
};

// A single animated card in the fan — springs in on mount and floats gently
function DecorativeCard({ color, targetRotation, index, reducedMotion }) {
  const progress = useSharedValue(reducedMotion ? 1 : 0);
  const idle = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) return;

    progress.value = withDelay(
      index * 120,
      withSpring(1, SPRING_CONFIG),
    );

    idle.value = withDelay(
      800 + index * 120,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 2400 + index * 200, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2400 + index * 200, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const rotation = interpolate(progress.value, [0, 1], [0, targetRotation]);
    const translateY = interpolate(progress.value, [0, 1], [30, 0]);
    const scale = interpolate(progress.value, [0, 1], [0.85, 1]);
    const idleFloat = interpolate(idle.value, [0, 1], [0, 3]);
    const idleRotate = interpolate(idle.value, [0, 1], [0, 0.5 * (index === 1 ? -1 : 1)]);

    return {
      transform: [
        { translateY: translateY - idleFloat },
        { rotate: `${rotation + idleRotate}deg` },
        { scale },
      ],
      opacity: interpolate(progress.value, [0, 0.3], [0, 1]),
    };
  });

  return (
    <Animated.View style={[styles.cardOuter, animatedStyle, { zIndex: index }]}>
      <View style={[styles.cardBorder, { borderRadius: 16 }]}>
        <View style={[styles.card, { backgroundColor: color, borderRadius: 14 }]} />
      </View>
    </Animated.View>
  );
}

// Animated logo shown on the login screen — three fanned cards with "Cardy" text
export default function CardStackLogo() {
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const [reducedMotion, setReducedMotion] = React.useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setReducedMotion(enabled);
      if (enabled) {
        logoOpacity.value = 1;
        logoScale.value = 1;
      }
    });
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    logoOpacity.value = withDelay(
      500,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) }),
    );
    logoScale.value = withDelay(
      500,
      withSpring(1, { damping: 16, stiffness: 100, mass: 0.6 }),
    );
  }, [reducedMotion]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.fanContainer}>
        {CARDS.map((card, index) => (
          <DecorativeCard
            key={index}
            color={card.color}
            targetRotation={card.rotation}
            index={index}
            reducedMotion={reducedMotion}
          />
        ))}
      </View>

      <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
        <Text style={styles.brand}>Cardy</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: CARD_HEIGHT + 40,
  },
  fanContainer: {
    width: CARD_WIDTH + 80,
    height: CARD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardOuter: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  cardBorder: {
    padding: BORDER_WIDTH,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  logoContainer: {
    position: 'absolute',
    zIndex: 10,
  },
  brand: {
    fontSize: 44,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
});
