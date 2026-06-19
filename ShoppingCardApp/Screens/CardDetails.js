import { View, Text } from 'react-native';
import BarcodeText from '../Components/BarcodeText';

export default function CardDetailScreen({ route }) {
  const { card } = route.params;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: card.colorHex,
        alignItems: 'center',
        paddingTop: 60
      }}
    >
      <Text style={{ color: '#fff', fontSize: 28, fontWeight: '700' }}>
        {card.storeName}
      </Text>

      <View
        style={{
          backgroundColor: '#fff',
          borderRadius: 12,
          padding: 20,
          marginTop: 40,
          alignItems: 'center',
        }}
      >
        <BarcodeText value={card.barcode || card.cardNumber} />
      </View>
    </View>
  );
}