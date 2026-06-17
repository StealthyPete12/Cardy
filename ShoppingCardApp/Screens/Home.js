import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import CardStack from '../Components/CardStack';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';

function lightenHex(hex, amount = 30) {
  if (!hex) return '#ECECEC';
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function mapApiCard(card, index) {
  const color = card.colorHex || '#DCDCDC';
  return {
    id: card.id,
    storeName: card.storeName,
    barcode: card.barcode,
    barcodeType: card.barcodeFormat,
    cardNumber: card.barcode,
    holderName: '',
    primaryColor: color,
    secondaryColor: lightenHex(color),
    textColor: '#FFFFFF',
    logoUrl: card.logoUrl,
    cornerRadius: 20,
    stackOrder: index,
  };
}

export default function Home() {
  const { signOut } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const fetchCards = async () => {
        try {
          setLoading(true);
          setError(null);
          console.log('[Home] Fetching cards from API...');
          const data = await api('/cards');
          console.log('[Home] Raw API response:', JSON.stringify(data));
          if (!cancelled) {
            const rows = Array.isArray(data) ? data : [];
            const mapped = rows.map(mapApiCard);
            console.log('[Home] Mapped cards:', JSON.stringify(mapped));
            setCards(mapped);
          }
        } catch (err) {
          console.log('[Home] FETCH CARDS ERROR:', err);
          if (!cancelled) {
            setError(err.message);
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

      fetchCards();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Wallet</Text>
            <Text style={styles.subtitle}>
              {cards.length} {cards.length === 1 ? 'card' : 'cards'}
            </Text>
          </View>
          <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>Failed to load cards</Text>
          </View>
        ) : (
          <CardStack
            key={cards.map((c) => c.id).join(',')}
            cards={cards}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000',
  },
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
    fontWeight: '500',
  },
  logoutButton: {
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
  },
});
