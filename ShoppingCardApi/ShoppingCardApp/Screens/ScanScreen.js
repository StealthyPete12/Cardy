import { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { api } from '../api';

export default function ScanScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(null); // { data, type }
  const [storeName, setStoreName] = useState('');

  if (!permission?.granted)
    return <Button title="Allow camera" onPress={requestPermission} />;

  if (!scanned)
    return (
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'code128', 'qr'],
        }}
        onBarcodeScanned={({ data, type }) => setScanned({ data, type })}
      />
    );

  const save = async () => {
    await api('/cards', {
      method: 'POST',
      body: JSON.stringify({
        storeName,
        barcode: scanned.data,
        barcodeFormat: scanned.type.toUpperCase(),
        logoUrl: null,
        colorHex: '#1E88E5',
      }),
    });
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
      <Text style={{ marginBottom: 16 }}>Scanned: {scanned.data}</Text>
      <TextInput placeholder="Store name" value={storeName}
        onChangeText={setStoreName}
        style={{ borderBottomWidth: 1, marginBottom: 24 }} />
      <Button title="Save card" onPress={save} disabled={!storeName} />
    </View>
  );
}