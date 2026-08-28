import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Modal, TextInput, ScrollView, SafeAreaView } from 'react-native';
import { useTemplates, useCalculateTemplate, Template, CalculatedTemplate } from '../hooks/useTemplates';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export function TemplatesScreen() {
  const { data: templates, isLoading, error } = useTemplates();
  const calculateMutation = useCalculateTemplate();
  
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [peopleStr, setPeopleStr] = useState<string>('4');
  const [calculatedData, setCalculatedData] = useState<CalculatedTemplate | null>(null);
  
  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setCalculatedData(null);
    setPeopleStr('4'); // default 4 people
  };
  
  const handleCalculate = async () => {
    if (!selectedTemplate) return;
    const numPeople = parseInt(peopleStr, 10);
    if (isNaN(numPeople) || numPeople <= 0) return;
    
    try {
      const result = await calculateMutation.mutateAsync({ 
        templateId: selectedTemplate.id, 
        people: numPeople 
      });
      setCalculatedData(result);
    } catch (err) {
      console.error(err);
    }
  };

  const closeModal = () => {
    setSelectedTemplate(null);
    setCalculatedData(null);
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#045bbd" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-gray-50">
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text className="text-red-500 mt-2 text-center">Erro ao carregar as listas.</Text>
      </View>
    );
  }

  const renderTemplateCard = ({ item }: { item: Template }) => {
    const iconName = item.name.toLowerCase().includes('churrasco') ? 'grill' 
                   : item.name.toLowerCase().includes('petisco') ? 'peanut'
                   : 'basket';
    
    return (
      <TouchableOpacity 
        className="bg-white p-4 rounded-2xl mb-4 shadow-sm border border-gray-100 flex-row items-center"
        onPress={() => handleSelectTemplate(item)}
      >
        <View className="bg-blue-100 w-12 h-12 rounded-full items-center justify-center mr-4">
          <MaterialCommunityIcons name={iconName as any} size={24} color="#045bbd" />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-navy">{item.name}</Text>
          <Text className="text-sm text-gray-500 mt-1">{item.category}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-6">
        <Text className="text-3xl font-extrabold text-navy mb-2">Listas Temáticas</Text>
        <Text className="text-gray-500 mb-6">Planeje suas compras com um clique</Text>
        
        <FlatList
          data={templates}
          keyExtractor={(item) => item.id}
          renderItem={renderTemplateCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      </View>

      {/* Modal de Detalhes e Cálculo */}
      <Modal
        visible={!!selectedTemplate}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <SafeAreaView className="flex-1 bg-gray-50">
          <View className="p-6 flex-1">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-navy flex-1">{selectedTemplate?.name}</Text>
              <TouchableOpacity onPress={closeModal} className="p-2">
                <Ionicons name="close" size={28} color="#4b5563" />
              </TouchableOpacity>
            </View>

            <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
              <Text className="text-gray-600 mb-2 font-medium">Para quantas pessoas?</Text>
              <View className="flex-row items-center">
                <TextInput
                  className="bg-gray-100 rounded-xl px-4 py-3 flex-1 mr-4 text-lg font-bold text-navy"
                  keyboardType="numeric"
                  value={peopleStr}
                  onChangeText={setPeopleStr}
                  maxLength={3}
                />
                <TouchableOpacity 
                  className={`bg-primary rounded-xl px-6 py-4 justify-center items-center ${calculateMutation.isPending ? 'opacity-70' : ''}`}
                  onPress={handleCalculate}
                  disabled={calculateMutation.isPending}
                >
                  {calculateMutation.isPending ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text className="text-white font-bold text-base">Calcular</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {calculatedData && (
              <View className="flex-1">
                <Text className="text-xl font-bold text-navy mb-4">Lista de Compras</Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {calculatedData.items.map((item, index) => (
                    <View key={index} className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-gray-50 flex-row justify-between items-center">
                      <View className="flex-1">
                        <Text className="text-lg font-bold text-navy">{item.name}</Text>
                        {item.required ? (
                          <Text className="text-xs text-primary font-semibold mt-1">Essencial</Text>
                        ) : (
                          <Text className="text-xs text-accent font-semibold mt-1">Opcional</Text>
                        )}
                      </View>
                      <View className="items-end ml-4">
                        <Text className="text-xl font-black text-navy">{item.calculated_qty.toFixed(1).replace('.0', '')}</Text>
                        <Text className="text-sm text-gray-500 font-medium">{item.unit}</Text>
                      </View>
                    </View>
                  ))}
                  <View className="h-10" />
                </ScrollView>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
