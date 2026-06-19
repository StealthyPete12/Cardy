import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { api } from '../api';
import AddCardModal from '../Components/AddCardModal';

export default function ScanScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState(null); // null = chooser, 'scan', 'manual'
  const [scanned, setScanned] = useState(null);
  const [storeName, setStoreName] = useState('');
  const [manualVisible, setManualVisible] = useState(false);

  const handleAdd = async (card) => {
    await api('/cards', {
      method: 'POST',
      body: JSON.stringify(card),
    });
    navigation.goBack();
  };

  const handleBarCodeScanned = ({ data, type }) => {
    setScanned({ data, type });
  };

  const saveScanned = async () => {
    if (!storeName.trim()) return;
    await api('/cards', {
      method: 'POST',
      body: JSON.stringify({
        storeName: storeName.trim(),
        cardNumber: scanned.data,
        barcode: scanned.data,
        barcodeFormat: scanned.type === 'org.iso.QRCode' ? 'CODE128' : scanned.type.toUpperCase(),
        logoUrl: null,
        colorHex: '#1E88E5',
      }),
    });
    navigation.goBack();
  };

  // Chooser: pick scan or manual
  if (mode === null) {
    return (
      <View style={styles.chooser}>
        <Text style={styles.chooserTitle}>Add a Card</Text>
        <Text style={styles.chooserSubtitle}>How would you like to add your card?</Text>

        <Pressable
          style={styles.optionButton}
          onPress={() => {
            if (!permission?.granted) {
              requestPermission().then((result) => {
                if (result.granted) setMode('scan');
              });
            } else {
              setMode('scan');
            }
          }}
        >
          <Text style={styles.optionIcon}>📷</Text>
          <View style={styles.optionTextWrap}>
            <Text style={styles.optionTitle}>Scan Barcode</Text>
            <Text style={styles.optionDesc}>Use your camera to scan the card</Text>
          </View>
        </Pressable>

        <Pressable
          style={styles.optionButton}
          onPress={() => {
            setMode('manual');
            setManualVisible(true);
          }}
        >
          <Text style={styles.optionIcon}>✏️</Text>
          <View style={styles.optionTextWrap}>
            <Text style={styles.optionTitle}>Enter Manually</Text>
            <Text style={styles.optionDesc}>Type in the card details yourself</Text>
          </View>
        </Pressable>

        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Cancel</Text>
        </Pressable>
      </View>
    );
  }

  // Manual entry mode
  if (mode === 'manual') {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <AddCardModal
          visible={manualVisible}
          onClose={() => {
            setManualVisible(false);
            setMode(null);
          }}
          onAdd={handleAdd}
        />
      </View>
    );
  }

  // Scan mode - permission denied fallback
  if (!permission?.granted) {
    return (
      <View style={styles.chooser}>
        <Text style={styles.chooserTitle}>Camera Permission Required</Text>
        <Text style={styles.chooserSubtitle}>
          Camera access is needed to scan barcodes. You can grant permission in Settings, or add your card manually.
        </Text>
        <Pressable style={styles.optionButton} onPress={requestPermission}>
          <Text style={styles.optionTitle}>Try Again</Text>
        </Pressable>
        <Pressable
          style={styles.optionButton}
          onPress={() => {
            setMode('manual');
            setManualVisible(true);
          }}
        >
          <Text style={styles.optionTitle}>Enter Manually Instead</Text>
        </Pressable>
        <Pressable style={styles.backButton} onPress={() => setMode(null)}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>
    );
  }

  // Scan mode - result captured
  if (scanned) {
    return (
      <View style={styles.resultContainer}>
        <Text style={styles.resultLabel}>Scanned Value</Text>
        <Text style={styles.resultValue}>{scanned.data}</Text>

        <Text style={styles.inputLabel}>Store Name</Text>
        <View style={styles.inputWrap}>
          <StoreNameInput value={storeName} onChange={setStoreName} />
        </View>

        <Pressable
          style={[styles.saveButton, !storeName.trim() && styles.saveButtonDisabled]}
          onPress={saveScanned}
          disabled={!storeName.trim()}
        >
          <Text style={styles.saveButtonText}>Save Card</Text>
        </Pressable>

        <Pressable style={styles.backButton} onPress={() => setScanned(null)}>
          <Text style={styles.backText}>Scan Again</Text>
        </Pressable>
      </View>
    );
  }

  // Scan mode - camera active
  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={StyleSheet.absoluteFill}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'code128', 'code39', 'upc_a', 'qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      <View style={styles.overlay}>
        <View style={styles.scanFrame} />
        <Text style={styles.scanHint}>Point at a barcode to scan</Text>
      </View>
      <Pressable style={styles.scanBackButton} onPress={() => setMode(null)}>
        <Text style={styles.backText}>Cancel</Text>
      </Pressable>
    </View>
  );
}

function StoreNameInput({ value, onChange }) {
  const { TextInput } = require('react-native');
  return (
    <TextInput
      style={styles.textInput}
      value={value}
      onChangeText={onChange}
      placeholder="e.g. Woolworths"
      placeholderTextColor="rgba(255,255,255,0.4)"
      autoFocus
    />
  );
}

const styles = StyleSheet.create({
  chooser: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  chooserTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
  },
  chooserSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 36,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 20,
    width: '100%',
    marginBottom: 14,
  },
  optionIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  optionTextWrap: {
    flex: 1,
  },
  optionTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  optionDesc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    marginTop: 2,
  },
  backButton: {
    marginTop: 20,
    padding: 12,
  },
  backText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 260,
    height: 160,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12,
  },
  scanHint: {
    color: '#fff',
    fontSize: 15,
    marginTop: 20,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  scanBackButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultContainer: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    padding: 32,
  },
  resultLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  resultValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 32,
  },
  inputLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputWrap: {
    marginBottom: 24,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
