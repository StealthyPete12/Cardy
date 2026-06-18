import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  StyleSheet,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SCREEN_WIDTH = Dimensions.get('window').width;

const COLOR_PRESETS = [
  '#1A1A1A',
  '#D32F2F',
  '#0D47A1',
  '#2E7D32',
  '#F57C00',
  '#7B1FA2',
  '#00838F',
  '#C62828',
  '#283593',
  '#558B2F',
];

function generateBarcode() {
  const digits = [];
  for (let i = 0; i < 12; i++) {
    digits.push(Math.floor(Math.random() * 10));
  }
  return digits.join('');
}

export default function AddCardModal({ visible, onClose, onAdd }) {
  const [storeName, setStoreName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [colorHex, setColorHex] = useState(COLOR_PRESETS[0]);
  const [logoUrl, setLogoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setStoreName('');
    setCardNumber('');
    setColorHex(COLOR_PRESETS[0]);
    setLogoUrl('');
    setSubmitting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!storeName.trim()) return;
    setSubmitting(true);
    const barcode = generateBarcode();
    const card = {
      storeName: storeName.trim(),
      cardNumber: cardNumber.trim() || barcode,
      barcode,
      barcodeFormat: 'CODE128',
      logoUrl: logoUrl.trim() || null,
      colorHex,
    };
    try {
      await onAdd(card);
      reset();
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <View style={styles.sheet}>
              <View style={styles.handle} />

              <View style={styles.header}>
                <Pressable onPress={handleClose} hitSlop={8}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Text style={styles.headerTitle}>New Card</Text>
                <Pressable
                  onPress={handleSubmit}
                  disabled={!storeName.trim() || submitting}
                  hitSlop={8}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#007AFF" />
                  ) : (
                    <Text
                      style={[
                        styles.addText,
                        !storeName.trim() && styles.addTextDisabled,
                      ]}
                    >
                      Add
                    </Text>
                  )}
                </Pressable>
              </View>

              <ScrollView
                style={styles.form}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.label}>Store Name</Text>
                <TextInput
                  style={styles.input}
                  value={storeName}
                  onChangeText={setStoreName}
                  placeholder="e.g. Woolworths"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  autoFocus
                />

                <Text style={styles.label}>Card Number</Text>
                <TextInput
                  style={styles.input}
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  placeholder="Optional"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                />

                <Text style={styles.label}>Logo URL</Text>
                <TextInput
                  style={styles.input}
                  value={logoUrl}
                  onChangeText={setLogoUrl}
                  placeholder="https://example.com/logo.png"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  autoCapitalize="none"
                  keyboardType="url"
                />

                <Text style={styles.label}>Theme Color</Text>
                <View style={styles.colorGrid}>
                  {COLOR_PRESETS.map((color) => (
                    <Pressable
                      key={color}
                      onPress={() => setColorHex(color)}
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: color },
                        colorHex === color && styles.colorSelected,
                      ]}
                    />
                  ))}
                </View>

                <View style={styles.spacer} />
              </ScrollView>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  keyboardView: {
    justifyContent: 'flex-end',
  },
  safeArea: {
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  cancelText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '400',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  addText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  addTextDisabled: {
    opacity: 0.35,
  },
  form: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  label: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSelected: {
    borderColor: '#fff',
    borderWidth: 3,
  },
  spacer: {
    height: 40,
  },
});
