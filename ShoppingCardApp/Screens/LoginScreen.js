import { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { api } from '../api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // ✅ LOGIN FUNCTION
  const login = async () => {
    try {
      console.log('LOGIN button pressed');

      const response = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      console.log('Login response:', response);

      const { token } = response;

      await SecureStore.setItemAsync('token', token);

      navigation.replace('Wallet');
    } catch (err) {
      console.log('Login error:', err.message);
      Alert.alert('Login failed', err.message);
    }
  };

  // ✅ REGISTER FUNCTION
  const register = async () => {
    try {
      console.log('REGISTER button pressed');

      const response = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      console.log('Register response:', response);

      const { token } = response;

      await SecureStore.setItemAsync('token', token);

      Alert.alert('Success', 'Account created!');
      navigation.replace('Wallet');
    } catch (err) {
      console.log('Register error:', err.message);
      Alert.alert('Register failed', err.message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={{ borderBottomWidth: 1, marginBottom: 16 }}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderBottomWidth: 1, marginBottom: 24 }}
      />

      {/* ✅ LOGIN BUTTON */}
      <Button title="Log in" onPress={login} />

      {/* spacing */}
      <View style={{ height: 12 }} />

      {/* ✅ REGISTER BUTTON */}
      <Button title="Register" onPress={register} />
    </View>
  );
}