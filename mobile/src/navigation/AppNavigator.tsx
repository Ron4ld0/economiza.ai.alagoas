import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FeedScreen } from '../screens/FeedScreen';
import { ScannerScreen } from '../screens/ScannerScreen';
import { TemplatesScreen } from '../screens/TemplatesScreen';
import { AssistantScreen } from '../screens/AssistantScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { View, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#045bbd',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f3f4f6',
          elevation: 10,
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowOffset: { width: 0, height: -4 },
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen 
        name="Feed" 
        component={FeedScreen} 
        options={{ 
          tabBarLabel: 'Ofertas',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={26} color={color} />
          )
        }}
      />
      <Tab.Screen 
        name="Templates" 
        component={TemplatesScreen} 
        options={{
          tabBarLabel: 'Listas',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? "clipboard-list" : "clipboard-list-outline"} size={26} color={color} />
          )
        }}
      />
      <Tab.Screen 
        name="Scanner" 
        component={ScannerScreen} 
        options={{
          tabBarLabel: 'Escanear',
          tabBarIcon: ({ color, focused }) => (
            <View className={`rounded-xl w-14 h-8 justify-center items-center ${focused ? 'bg-primary-light' : 'bg-transparent'}`}>
               <MaterialCommunityIcons name="barcode-scan" size={26} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Assistant" 
        component={AssistantScreen} 
        options={{
          tabBarLabel: 'IA',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? "robot" : "robot-outline"} size={26} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#045bbd" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <TabNavigator /> : <LoginScreen />}
    </NavigationContainer>
  );
}
