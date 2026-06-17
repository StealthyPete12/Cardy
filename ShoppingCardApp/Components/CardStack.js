import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import CardItem, { CARD_HEIGHT, CARD_WIDTH } from './CardItem';
import ExpandedCard from './ExpandedCard';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const VELOCITY_THRESHOLD = 500;
const MAX_VISIBLE = 4;
const STACK_OFFSET_Y = 55;
const STACK_SCALE_STEP = 0.04;

const SPRING_CONFIG = { damping: 20, stiffness: 180, mass: 0.8 };

export default function CardStack({ cards }) {
  const initialCards = [...cards].sort((a, b) => a.stackOrder - b.stackOrder);
  const [cardStack, setCardStack] = useState(initialCards);
  const [expandedCard, setExpandedCard] = useState(null);

  const translateX = useSharedValue(0);
  const swipeProgress = useSharedValue(0);

  const onSwiped = useCallback(() => {
    console.log('SWIPED');
    translateX.value = 0;
    swipeProgress.value = 0;
    setCardStack((prev) => {
      const next = prev.slice(1);
      console.log('STACK SIZE:', next.length);
      return next;
    });
  }, [translateX, swipeProgress]);

  const onTap = useCallback(() => {
    if (cardStack.length > 0) setExpandedCard(cardStack[0]);
  }, [cardStack]);

  const onCloseExpanded = useCallback(() => {
    setExpandedCard(null);
  }, []);

  const onReset = useCallback(() => {
    setCardStack(initialCards);
    translateX.value = 0;
    swipeProgress.value = 0;
  }, [initialCards, translateX, swipeProgress]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .onUpdate((e) => {
      translateX.value = e.translationX;
      swipeProgress.value = interpolate(
        Math.abs(e.translationX),
        [0, SCREEN_WIDTH * 0.5],
        [0, 1]
      );
    })
    .onEnd((e) => {
      const shouldDismiss =
        Math.abs(e.translationX) > SWIPE_THRESHOLD ||
        Math.abs(e.velocityX) > VELOCITY_THRESHOLD;

      if (shouldDismiss) {
        const dir = Math.sign(e.translationX || e.velocityX);
        translateX.value = withTiming(
          dir * SCREEN_WIDTH * 1.5,
          { duration: 250, easing: Easing.out(Easing.cubic) },
          () => runOnJS(onSwiped)()
        );
      } else {
        translateX.value = withSpring(0, SPRING_CONFIG);
        swipeProgress.value = withSpring(0, SPRING_CONFIG);
      }
    });

  const tapGesture = Gesture.Tap().onEnd(() => runOnJS(onTap)());
  const composed = Gesture.Race(panGesture, tapGesture);

  const visibleCards = cardStack.slice(0, MAX_VISIBLE);
  const allSwiped = cardStack.length === 0;

  return (
    <View style={styles.container}>
      {allSwiped ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🃏</Text>
          <Text style={styles.emptyText}>No more cards</Text>
          <Pressable style={styles.resetButton} onPress={onReset}>
            <Text style={styles.resetText}>Reset Stack</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.stackContainer}>
          {visibleCards
            .slice()
            .reverse()
            .map((card, i) => {
              const realIndex = visibleCards.length - 1 - i;

              return realIndex === 0 ? (
                <TopCard
                  key={card.id}
                  card={card}
                  translateX={translateX}
                  gesture={composed}
                  zIndex={MAX_VISIBLE + 1}
                />
              ) : (
                <BehindCard
                  key={card.id}
                  card={card}
                  index={realIndex}
                  swipeProgress={swipeProgress}
                  zIndex={MAX_VISIBLE - realIndex}
                />
              );
            })}
        </View>
      )}

      <ExpandedCard
        card={expandedCard}
        visible={expandedCard !== null}
        onClose={onCloseExpanded}
      />
    </View>
  );
}

function TopCard({ card, translateX, gesture, zIndex }) {
  const style = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-15, 0, 15]
    );
    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, SCREEN_WIDTH * 0.5],
      [1, 0.5]
    );

    return {
      transform: [
        { translateX: translateX.value },
        { rotate: `${rotate}deg` },
      ],
      opacity,
      zIndex,
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.cardWrapper, styles.topCardPosition, style]}>
        <CardItem card={card} />
      </Animated.View>
    </GestureDetector>
  );
}

function BehindCard({ card, index, swipeProgress, zIndex }) {
  const style = useAnimatedStyle(() => {
    const baseY = index * STACK_OFFSET_Y;
    const baseScale = 1 - index * STACK_SCALE_STEP;

    const shiftY = interpolate(
      swipeProgress.value,
      [0, 1],
      [0, -STACK_OFFSET_Y]
    );

    const scaleBoost = interpolate(
      swipeProgress.value,
      [0, 1],
      [0, STACK_SCALE_STEP]
    );

    return {
      transform: [
        { translateY: baseY + shiftY },
        { scale: baseScale + scaleBoost },
      ],
      zIndex,
      opacity: interpolate(index, [0, MAX_VISIBLE - 1], [1, 0.7]),
    };
  });

  return (
    <Animated.View style={[styles.cardWrapper, styles.behindCardPosition, style]}>
      <CardItem card={card} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  stackContainer: {
    height: CARD_HEIGHT + (MAX_VISIBLE - 1) * STACK_OFFSET_Y + 20,
    alignItems: 'center',
  },
  cardWrapper: {
    position: 'absolute',
    width: CARD_WIDTH,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  topCardPosition: {
    top: 0,
  },
  behindCardPosition: {
    top: 0,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
  },
  resetButton: {
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  resetText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
