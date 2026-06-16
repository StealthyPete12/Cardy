import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './Screens/LoginScreen';
import WalletScreen from './Screens/WalletScreen';
import CardDetailScreen from './Screens/CardDetails';
import ScanScreen from './Screens/ScanScreen';

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