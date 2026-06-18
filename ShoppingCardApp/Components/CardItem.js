import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
export const CARD_WIDTH = width * 0.9;
export const CARD_HEIGHT = 210;

export default function CardItem({ card }) {
  const [logoError, setLogoError] = useState(false);
  const radius = card.cornerRadius || 20;

  return (
    <View style={[styles.card, { borderRadius: radius }]}>
      <LinearGradient
        colors={[card.primaryColor, card.secondaryColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
      />
      <View style={[styles.shimmer, { borderRadius: radius }]} />

      <View style={styles.content}>
        <View style={styles.topRow}>
          {card.logoUrl && !logoError ? (
            <Image
              source={{ uri: card.logoUrl }}
              style={styles.logo}
              onError={() => setLogoError(true)}
            />
          ) : (
            <View style={styles.logoFallback}>
              <Text style={[styles.logoInitial, { color: card.textColor }]}>
                {(card.storeName || '?')[0].toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={[styles.storeName, { color: card.textColor }]}>
            {card.storeName}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <Text style={[styles.cardNumber, { color: card.textColor }]}>
            {card.cardNumber}
          </Text>
          <Text style={[styles.holderName, { color: card.textColor }]}>
            {card.holderName}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    overflow: 'hidden',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 10,
    resizeMode: 'contain',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  logoFallback: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInitial: {
    fontSize: 20,
    fontWeight: '700',
  },
  storeName: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bottomRow: {
    gap: 4,
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 2,
    opacity: 0.9,
  },
  holderName: {
    fontSize: 13,
    fontWeight: '400',
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
});
