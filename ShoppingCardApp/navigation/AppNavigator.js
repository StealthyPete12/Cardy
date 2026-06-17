import React, { useState, useEffect, useMemo } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';

import AuthContext from '../contexts/AuthContext';
import LoginScreen from '../Screens/LoginScreen';
import Home from '../Screens/Home';
import WalletScreen from '../Screens/WalletScreen';
import CardDetailScreen from '../Screens/CardDetails';
import ScanScreen from '../Screens/ScanScreen';

const Stack = createNativeStackNavigator();

function isTokenExpired(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (payload.length % 4) payload += '=';
    const decoded = JSON.parse(atob(payload));
    if (!decoded.exp) return false;
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('token');
        if (token && !isTokenExpired(token)) {
          setUserToken(token);
        } else if (token) {
          await SecureStore.deleteItemAsync('token');
        }
      } catch (e) {
        console.log('Error loading token:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  const auth = useMemo(
    () => ({
      signIn: async (token) => {
        await SecureStore.setItemAsync('token', token);
        setUserToken(token);
      },

      signOut: async () => {
        try {
          await SecureStore.deleteItemAsync('token');
        } catch (e) {
          console.log('Error clearing token:', e);
        }
        setUserToken(null);
      },

      userToken,
    }),
    [userToken]
  );

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#000',
        }}
      >
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={auth}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>

          {userToken == null ? (
            <Stack.Screen name="Login" component={LoginScreen} />
          ) : (
            <>
              <Stack.Screen name="Home" component={Home} />
              <Stack.Screen name="Wallet" component={WalletScreen} />
              <Stack.Screen
                name="CardDetail"
                component={CardDetailScreen}
              />
              <Stack.Screen name="Scan" component={ScanScreen} />
            </>
          )}

        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
