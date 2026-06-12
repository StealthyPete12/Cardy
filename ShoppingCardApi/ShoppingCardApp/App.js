import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import WalletScreen from './screens/WalletScreen';
import CardDetailScreen from './screens/CardDetailScreen';
import ScanScreen from './screens/ScanScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Wallet" component={WalletScreen} />
        <Stack.Screen name="CardDetail" component={CardDetailScreen}
                      options={{ title: '' }} />
        <Stack.Screen name="Scan" component={ScanScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}