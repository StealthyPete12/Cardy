import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const login = async () => {
    try {
      setLoading(true);

      const response = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      console.log('LOGIN RESPONSE:', response);

      const token = response?.token;

      if (!token) {
        throw new Error('No token returned from server');
      }

      // ✅ Save + trigger navigation
      await signIn(token);

    } catch (err) {
      console.log('LOGIN ERROR:', err);
      Alert.alert('Login failed', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const register = async () => {
    try {
      setLoading(true);

      const response = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      console.log('REGISTER RESPONSE:', response);

      const token = response?.token;

      if (!token) {
        throw new Error('No token returned from server');
      }

      Alert.alert('Success', 'Account created!');

      // ✅ Save + navigate
      await signIn(token);

    } catch (err) {
      console.log('REGISTER ERROR:', err);
      Alert.alert('Register failed', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }

    isRegister ? register() : login();
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <View style={styles.header}>
          <Text style={styles.brand}>Cardy</Text>
          <Text style={styles.subtitle}>
            {isRegister ? 'Create your account' : 'Welcome back'}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#A0A0A0"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#A0A0A0"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>
                {isRegister ? 'Create Account' : 'Sign In'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {isRegister
              ? 'Already have an account?'
              : "Don't have an account?"}
          </Text>

          <TouchableOpacity
            onPress={() => setIsRegister(!isRegister)}
            disabled={loading}
          >
            <Text style={styles.footerLink}>
              {isRegister ? 'Sign In' : 'Create Account'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  brand: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 8,
    fontWeight: '500',
  },
  form: {
    gap: 18,
  },
  inputWrapper: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    gap: 6,
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});