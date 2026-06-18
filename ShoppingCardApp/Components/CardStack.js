import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDecay,
  withSpring,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import CardItem, { CARD_HEIGHT, CARD_WIDTH } from './CardItem';
import ExpandedCard from './ExpandedCard';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_PEEK = 60;
const EXPANDED_SPACING = CARD_HEIGHT + 20;
const EXPAND_SPRING = { damping: 22, stiffness: 200, mass: 0.8 };
const PUSHED_DOWN_BASE = SCREEN_HEIGHT * 0.65;
const PUSHED_CARD_SPACING = 18;

export default function CardStack({ cards, onDeleteCard }) {
  const [selectedCard, setSelectedCard] = useState(null);

  const scrollY = useSharedValue(0);
  const startY = useSharedValue(0);
  const expandProgress = useSharedValue(0);

  const numCards = cards.length;
  const maxScroll = Math.max(1, (numCards - 1) * (EXPANDED_SPACING - HEADER_PEEK));

  const onTapCard = useCallback((card) => {
    setSelectedCard(card);
    expandProgress.value = withSpring(1, EXPAND_SPRING);
  }, []);

  const onCloseStart = useCallback(() => {
    expandProgress.value = withSpring(0, EXPAND_SPRING);
  }, []);

  const onCloseExpanded = useCallback(() => {
    setSelectedCard(null);
  }, []);

  return (
    <View style={styles.container}>
      {cards.map((card, index) => (
        <WalletCard
          key={card.id}
          card={card}
          index={index}
          scrollY={scrollY}
          startY={startY}
          maxScroll={maxScroll}
          onTap={onTapCard}
          expandProgress={expandProgress}
        />
      ))}
      <ExpandedCard
        card={selectedCard}
        visible={selectedCard !== null}
        onClose={onCloseExpanded}
        onDelete={onDeleteCard}
        onCloseStart={onCloseStart}
      />
    </View>
  );
}

function WalletCard({ card, index, scrollY, startY, maxScroll, onTap, expandProgress }) {
  const panGesture = Gesture.Pan()
    .activeOffsetY([-5, 5])
    .onStart(() => {
      startY.value = scrollY.value;
    })
    .onUpdate((e) => {
      scrollY.value = Math.max(
        0,
        Math.min(maxScroll, startY.value + e.translationY)
      );
    })
    .onEnd((e) => {
      scrollY.value = withDecay({
        velocity: e.velocityY,
        clamp: [0, maxScroll],
      });
    });

  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(onTap)(card);
  });

  const gesture = Gesture.Race(panGesture, tapGesture);

  const animatedStyle = useAnimatedStyle(() => {
    const collapsedY = HEADER_PEEK * index;
    const expandedY = EXPANDED_SPACING * index;

    const stackY = interpolate(
      scrollY.value,
      [0, maxScroll],
      [collapsedY, expandedY],
      {
        extrapolateLeft: Extrapolation.CLAMP,
        extrapolateRight: Extrapolation.CLAMP,
      }
    );

    const pushedY = PUSHED_DOWN_BASE + index * PUSHED_CARD_SPACING;

    const translateY = interpolate(
      expandProgress.value,
      [0, 1],
      [stackY, pushedY],
      {
        extrapolateLeft: Extrapolation.CLAMP,
        extrapolateRight: Extrapolation.CLAMP,
      }
    );

    return {
      transform: [{ translateY }],
      zIndex: index,
      elevation: index + 1,
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.cardWrapper, animatedStyle]}>
        <CardItem card={card} />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  cardWrapper: {
    position: 'absolute',
    width: CARD_WIDTH,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
});
