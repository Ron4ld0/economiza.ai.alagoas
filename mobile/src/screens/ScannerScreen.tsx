import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, FlatList } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from '../hooks/useLocation';
import { SafeAreaView } from 'react-native-safe-area-context';

import Constants from 'expo-constants';

export const ScannerScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scannedEan, setScannedEan] = useState<string | null>(null);
  const { location } = useLocation();

  const getApiUrl = () => {
    const debuggerHost = Constants.expoConfig?.hostUri;
    const ip = debuggerHost ? debuggerHost.split(':')[0] : 'localhost';
    return `http://${ip}:8000/api/v1`;
  };

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const { data: productData, isLoading, isError } = useQuery({
    queryKey: ['productPrices', scannedEan, location?.latitude, location?.longitude],
    queryFn: async () => {
      const baseUrl = getApiUrl();
      const response = await fetch(
        `${baseUrl}/products/${scannedEan}/prices?lat=${location!.latitude}&lng=${location!.longitude}&radius_km=10.0`
      );
      if (!response.ok) {
        throw new Error('Product not found');
      }
      return response.json();
    },
    enabled: !!scannedEan && !!location,
  });

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (!scannedEan) {
      setScannedEan(data);
    }
  };

  if (hasPermission === null) {
    return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#045bbd" /></View>;
  }
  if (hasPermission === false) {
    return <View className="flex-1 justify-center items-center p-4"><Text className="text-center">Sem acesso à câmera.</Text></View>;
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      {!scannedEan ? (
        <CameraView
          onBarcodeScanned={scannedEan ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["ean13", "ean8", "upc_e", "upc_a"],
          }}
          style={StyleSheet.absoluteFillObject}
        >
          <View className="flex-1 bg-transparent justify-center items-center">
            <View className="w-64 h-48 border-2 border-primary rounded-lg bg-black/10" />
            <Text className="text-white mt-4 font-bold bg-black/50 p-2 rounded">Mire no código de barras</Text>
          </View>
        </CameraView>
      ) : (
        <View className="flex-1 bg-gray-50">
          <View className="p-4 bg-white border-b border-gray-200 flex-row justify-between items-center">
            <Text className="text-xl font-bold text-navy flex-1" numberOfLines={2}>
              {productData ? productData.product_name : `EAN: ${scannedEan}`}
            </Text>
            <Button title="Ler Outro" onPress={() => setScannedEan(null)} color="#045bbd" />
          </View>
          
          {isLoading && (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#045bbd" />
              <Text className="mt-4 text-gray-600">Buscando preços na região...</Text>
            </View>
          )}

          {isError && !isLoading && (
            <View className="flex-1 justify-center items-center p-6">
              <Text className="text-red-500 font-medium text-center text-lg">Produto não encontrado na região.</Text>
            </View>
          )}

          {productData && productData.prices && (
            <FlatList
              data={productData.prices}
              keyExtractor={(item: any) => item.id}
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item }) => (
                <View className="bg-white p-4 mb-3 rounded-xl shadow-sm border border-gray-100">
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-lg font-bold text-navy flex-1 mr-2">{item.establishment.name}</Text>
                    <Text className="text-xl font-extrabold text-primary">R$ {item.price.toFixed(2)}</Text>
                  </View>
                  <Text className="text-sm text-gray-500 mb-3">{item.establishment.address}</Text>
                  <View className="flex-row justify-between items-center">
                    <View className="bg-blue-50 px-2 py-1 rounded-md">
                      <Text className="text-xs text-blue-700 font-medium">{item.badge}</Text>
                    </View>
                    <Text className="text-xs text-gray-400 font-medium">{item.distance_km} km</Text>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
};
