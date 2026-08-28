import React, { useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from '../hooks/useLocation';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

interface FeedItem {
  id: string;
  product_name: string;
  raw_description: string;
  price: number;
  badge: string;
  distance_km: number;
  establishment: {
    name: string;
    address: string;
  };
}

const getApiUrl = () => {
  const debuggerHost = Constants.expoConfig?.hostUri;
  const ip = debuggerHost ? debuggerHost.split(':')[0] : 'localhost';
  return `http://${ip}:8000/api/v1`;
};

const fetchFeed = async (lat: number, lng: number, category: string, sortBy: string): Promise<FeedItem[]> => {
  const baseUrl = getApiUrl();
  let url = `${baseUrl}/feed/?lat=${lat}&lng=${lng}&radius_km=10.0&sort_by=${sortBy}`;
  if (category && category !== 'Todos') {
    url += `&category=${encodeURIComponent(category)}`;
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return data.items;
};

const CATEGORIES = ['Todos', 'Alimentação', 'Bebidas', 'Limpeza', 'Higiene', 'Outros'];

export const FeedScreen = () => {
  const { signOut, user } = useAuth();
  const { location, errorMsg, isLoading: isLocating } = useLocation();
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'distance_asc'>('relevance');

  const { data: popularItems, isLoading: isLoadingPopular } = useQuery({
    queryKey: ['feed_popular', location?.latitude, location?.longitude],
    queryFn: () => fetchFeed(location!.latitude, location!.longitude, 'Todos', 'popular'),
    enabled: !!location,
  });

  const { data: feedItems, isLoading: isFetching, isError } = useQuery({
    queryKey: ['feed_regular', location?.latitude, location?.longitude, selectedCategory, sortBy],
    queryFn: () => fetchFeed(location!.latitude, location!.longitude, selectedCategory, sortBy),
    enabled: !!location,
  });

  const renderItem = ({ item }: { item: FeedItem }) => (
    <View className="bg-white p-4 mb-3 mx-4 rounded-xl shadow-sm border border-gray-100">
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-lg font-bold text-navy flex-1 mr-2">{item.product_name}</Text>
        <Text className="text-xl font-extrabold text-primary">R$ {item.price.toFixed(2)}</Text>
      </View>
      <Text className="text-sm text-gray-500 mb-3">{item.raw_description}</Text>
      
      <View className="flex-row justify-between items-start mt-2 border-t border-gray-50 pt-2">
        <View className="flex-row items-center">
          <View className="bg-blue-50 px-2 py-1 rounded-md mr-2">
            <Text className="text-xs text-blue-700 font-medium">{item.badge}</Text>
          </View>
          <Text className="text-xs text-gray-400 font-medium">{item.distance_km} km</Text>
        </View>
      </View>
      <View className="mt-2">
        <Text className="text-xs text-gray-500 font-bold uppercase">{item.establishment.name}</Text>
        <View className="flex-row items-center mt-1">
          <Ionicons name="location" size={12} color="#9ca3af" />
          <Text className="text-xs text-gray-400 ml-1" numberOfLines={1}>{item.establishment.address}</Text>
        </View>
      </View>
    </View>
  );

  const renderPopularItem = ({ item }: { item: FeedItem }) => (
    <View className="bg-primary p-4 mr-3 rounded-xl shadow-sm w-48">
      <View className="flex-row justify-between items-start mb-1">
        <Text className="text-sm font-bold text-white flex-1 mr-2" numberOfLines={2}>{item.product_name}</Text>
      </View>
      <Text className="text-xl font-extrabold text-accent mt-2">R$ {item.price.toFixed(2)}</Text>
      <Text className="text-xs text-blue-100 mt-2" numberOfLines={1}>{item.establishment.name}</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 py-2 bg-white border-b border-gray-200 mb-2 flex-row justify-between items-center h-20">
        <View className="flex-1 items-start justify-center">
          <Text className="text-base font-extrabold text-navy" numberOfLines={1}>
            Olá, {user?.name?.split(' ')[0] || 'Usuário'}
          </Text>
          {location && (
            <View className="flex-row items-center mt-1">
              <Ionicons name="location" size={10} color="#9ca3af" />
              <Text className="text-[10px] text-gray-500 ml-1" numberOfLines={1}>
                Raio de 10km
              </Text>
            </View>
          )}
        </View>
        <View className="flex-1 items-center justify-center">
          <Image source={require('../../assets/logo.png')} className="w-32 h-14" resizeMode="contain" />
        </View>
        <View className="flex-1 items-end justify-center">
          <TouchableOpacity onPress={signOut} className="bg-red-50 p-2 rounded-full">
            <Ionicons name="log-out-outline" size={20} color="#ff3b30" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Popular Section */}
        <View className="mt-2 mb-4">
          <View className="flex-row items-center px-4 mb-3">
            <Ionicons name="trending-up" size={20} color="#ff3b30" />
            <Text className="text-lg font-bold text-navy ml-2">Em Alta na Região</Text>
          </View>
          {isLoadingPopular || isLocating ? (
            <View className="h-28 justify-center items-center">
              <ActivityIndicator size="small" color="#045bbd" />
            </View>
          ) : (
            <FlatList
              horizontal
              data={popularItems || []}
              keyExtractor={(item) => 'pop_' + item.id}
              renderItem={renderPopularItem}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              ListEmptyComponent={<Text className="px-4 text-gray-500">Nenhum produto em alta no momento.</Text>}
            />
          )}
        </View>

        {/* Categories Section */}
        <View className="mb-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                className={`px-4 py-2 mr-2 rounded-full border ${selectedCategory === cat ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
              >
                <Text className={`font-medium ${selectedCategory === cat ? 'text-white' : 'text-gray-600'}`}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Sort Controls */}
        <View className="px-4 mb-3 flex-row justify-between items-center">
          <Text className="text-sm font-bold text-navy uppercase tracking-wider">{selectedCategory}</Text>
          <View className="flex-row items-center bg-gray-100 rounded-lg p-1">
            <TouchableOpacity 
              className={`px-3 py-1 rounded-md ${sortBy === 'relevance' ? 'bg-white shadow-sm' : ''}`}
              onPress={() => setSortBy('relevance')}
            >
              <Text className={`text-xs font-bold ${sortBy === 'relevance' ? 'text-blue-700' : 'text-gray-500'}`}>Custo-Benefício</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className={`px-3 py-1 rounded-md ${sortBy === 'price_asc' ? 'bg-white shadow-sm' : ''}`}
              onPress={() => setSortBy('price_asc')}
            >
              <Text className={`text-xs font-bold ${sortBy === 'price_asc' ? 'text-blue-700' : 'text-gray-500'}`}>Menor Preço</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className={`px-3 py-1 rounded-md ${sortBy === 'distance_asc' ? 'bg-white shadow-sm' : ''}`}
              onPress={() => setSortBy('distance_asc')}
            >
              <Text className={`text-xs font-bold ${sortBy === 'distance_asc' ? 'text-blue-700' : 'text-gray-500'}`}>Mais Próximo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Status messages */}
        {isLocating && (
          <View className="py-10 justify-center items-center">
            <ActivityIndicator size="large" color="#045bbd" />
            <Text className="mt-4 text-gray-600 font-medium">Buscando sua localização...</Text>
          </View>
        )}

        {!isLocating && errorMsg && (
          <View className="p-4 m-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Text className="text-yellow-800 text-center">{errorMsg}</Text>
          </View>
        )}

        {!isLocating && isFetching && (
          <View className="py-10 justify-center items-center">
            <ActivityIndicator size="large" color="#045bbd" />
            <Text className="mt-4 text-gray-600 font-medium">Carregando feed de preços...</Text>
          </View>
        )}

        {!isLocating && !isFetching && isError && (
          <View className="py-10 justify-center items-center p-6">
            <Text className="text-red-500 font-medium text-center text-lg">Oops! Não foi possível conectar ao servidor.</Text>
            <Text className="text-gray-500 mt-2 text-center text-sm">Verifique sua conexão ou se a API está rodando.</Text>
          </View>
        )}

        {/* Regular Feed List inside ScrollView */}
        {!isLocating && !isFetching && feedItems && feedItems.map((item) => (
          <View key={'reg_' + item.id}>
            {renderItem({ item })}
          </View>
        ))}
        
        {!isLocating && !isFetching && feedItems && feedItems.length === 0 && (
          <Text className="text-center text-gray-500 mt-10 mb-10">
            Nenhuma oferta encontrada nesta categoria perto de você.
          </Text>
        )}
        
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
};
