import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  widget_type?: string;
  widget_data?: any;
}

const getApiUrl = () => {
  const debuggerHost = Constants.expoConfig?.hostUri;
  const ip = debuggerHost ? debuggerHost.split(':')[0] : 'localhost';
  return `http://${ip}:8000/api/v1`;
};

export function AssistantScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      text: 'Olá! Sou seu assistente de compras inteligente. Me peça para montar um "Churrasco para 10 pessoas" ou busque por preços!'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText.trim()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    
    try {
      const baseUrl = getApiUrl();
      const response = await fetch(`${baseUrl}/assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userMsg.text })
      });
      
      if (!response.ok) throw new Error('Erro na API');
      
      const data = await response.json();
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: data.text,
        widget_type: data.widget_type,
        widget_data: data.widget_data
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: 'Desculpe, estou com problemas de conexão. Tente novamente em instantes!'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderWidget = (msg: Message) => {
    if (msg.widget_type === 'template_list' && msg.widget_data) {
      const template = msg.widget_data;
      return (
        <View className="bg-white rounded-xl p-4 mt-2 shadow-sm border border-blue-100">
          <View className="flex-row items-center mb-2 border-b border-blue-100 pb-2">
            <Ionicons name="cart-outline" size={16} color="#045bbd" />
            <Text className="text-navy font-bold ml-2">
              {template.template_name} ({template.people} pessoas)
            </Text>
          </View>
          {template.items.map((item: any, idx: number) => (
            <View key={idx} className="flex-row justify-between mb-1">
              <Text className="text-gray-700 font-medium">{item.name}</Text>
              <Text className="text-gray-900 font-bold">{item.calculated_qty} {item.unit}</Text>
            </View>
          ))}
        </View>
      );
    }
    
    if (msg.widget_type === 'product_offers' && msg.widget_data) {
      return (
        <View className="mt-2">
          {msg.widget_data.offers.map((offer: any, idx: number) => (
            <View key={offer.id || idx} className="bg-white rounded-xl p-4 mb-2 shadow-sm border border-gray-100">
              <View className="flex-row justify-between items-start mb-1">
                <Text className="text-gray-800 font-bold flex-1 mr-2" numberOfLines={2}>{offer.product_name}</Text>
                <Text className="text-primary font-extrabold text-lg">R$ {offer.price.toFixed(2)}</Text>
              </View>
              <View className="flex-row items-center mb-1">
                <Ionicons name="storefront-outline" size={14} color="#6b7280" />
                <Text className="text-gray-500 font-medium text-sm ml-1">{offer.establishment_name}</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="location-outline" size={12} color="#9ca3af" />
                <Text className="text-gray-400 text-xs ml-1">{offer.address}</Text>
              </View>
            </View>
          ))}
        </View>
      );
    }
    
    return null;
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    
    return (
      <View className={`mb-4 max-w-[85%] ${isUser ? 'self-end' : 'self-start'}`}>
        <View className={`p-3 rounded-2xl ${isUser ? 'bg-navy rounded-tr-sm' : 'bg-white rounded-tl-sm shadow-sm border border-gray-100'}`}>
          <Text className={`${isUser ? 'text-white' : 'text-gray-800'} text-base`}>
            {item.text}
          </Text>
        </View>
        {!isUser && renderWidget(item)}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'left', 'right']}>
      <View className="bg-white p-4 flex-row items-center shadow-sm z-10 border-b border-gray-100">
        <View className="bg-blue-100 w-10 h-10 rounded-full items-center justify-center mr-3">
          <MaterialCommunityIcons name="robot-outline" size={24} color="#045bbd" />
        </View>
        <View>
          <Text className="text-lg font-bold text-gray-800">Economiza.Ai</Text>
          <Text className="text-primary font-medium text-xs">Online</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {isLoading && (
          <View className="absolute bottom-20 left-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex-row items-center">
            <ActivityIndicator size="small" color="#045bbd" className="mr-2" />
            <Text className="text-gray-500 text-sm">Digitando...</Text>
          </View>
        )}

        <View className="p-3 bg-white border-t border-gray-200 flex-row items-center">
          <TextInput
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 min-h-[44px] max-h-24 text-base"
            placeholder="Digite sua mensagem..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
            className={`ml-2 w-11 h-11 rounded-full justify-center items-center ${inputText.trim() ? 'bg-primary' : 'bg-gray-200'}`}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={20} color={inputText.trim() ? "white" : "#9ca3af"} style={{ marginLeft: 2 }} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
