import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api';

// List view of all cards — tap to view details, long-press to delete
export default function WalletScreen({ navigation }) {
  const [cards, setCards] = useState([]);

  // Reload cards every time this screen comes into focus
  useFocusEffect(useCallback(() => {
    api('/cards').then(setCards).catch(console.warn);
  }, []));

  // Confirm before deleting a card
  const remove = (id) =>
    Alert.alert('Delete card?', '', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive',
        onPress: async () => {
          await api(`/cards/${id}`, { method: 'DELETE' });
          setCards(cards.filter(c => c.id !== id));
        }},
    ]);

  return (
    <View style={{ flex: 1, backgroundColor: '#DCDCDC' }}>
      <FlatList
        data={cards}
        keyExtractor={c => String(c.id)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('CardDetail', { card: item })}
            onLongPress={() => remove(item.id)}
            style={{
              backgroundColor: item.colorHex,
              borderRadius: 16,
              height: 180,
              padding: 20,
              marginBottom: -120, // Negative margin creates the overlapping wallet stack look
              shadowColor: '#000', shadowOpacity: 0.2,
              shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
              elevation: 4,
            }}>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700' }}>
              {item.storeName}
            </Text>
          </TouchableOpacity>
        )}
        ListFooterComponent={<View style={{ height: 140 }} />}
      />
      <TouchableOpacity
        onPress={() => navigation.navigate('Scan')}
        style={{ position: 'absolute', bottom: 30, right: 30,
          backgroundColor: '#CCCCCC', width: 56, height: 56, borderRadius: 28,
          alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#fff', fontSize: 30 }}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}