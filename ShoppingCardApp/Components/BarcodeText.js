import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import { LibreBarcode128_400Regular } from '@expo-google-fonts/libre-barcode-128';

export default function BarcodeText({ value, barcodeFontSize = 80, textFontSize = 14 }) {
  const [fontsLoaded] = useFonts({ LibreBarcode128_400Regular });

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#999" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text
        style={[styles.barcode, { fontSize: barcodeFontSize }]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
      <Text style={[styles.readable, { fontSize: textFontSize }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  barcode: {
    fontFamily: 'LibreBarcode128_400Regular',
    color: '#000',
  },
  readable: {
    marginTop: 6,
    fontWeight: '600',
    color: '#333',
    letterSpacing: 3,
  },
});
