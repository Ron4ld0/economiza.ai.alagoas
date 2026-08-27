import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';

const Stack = createNativeStackNavigator();

function PlaceholderScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Economiza.AI Alagoas</Text>
    </View>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={PlaceholderScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
