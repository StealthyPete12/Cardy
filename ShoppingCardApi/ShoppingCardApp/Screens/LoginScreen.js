import { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { api } from '../api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const login = async () => {
    const { token } = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    await SecureStore.setItemAsync('token', token);
    navigation.replace('Wallet');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail}
        autoCapitalize="none" style={{ borderBottomWidth: 1, marginBottom: 16 }} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword}
        secureTextEntry style={{ borderBottomWidth: 1, marginBottom: 24 }} />
      <Button title="Log in" onPress={login} />
    </View>
  );
}