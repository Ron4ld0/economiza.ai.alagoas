import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export function LoginScreen() {
  const { signInWithGoogle, requestEmailCode, verifyEmailCode } = useAuth();
  
  const [step, setStep] = useState<'initial' | 'email' | 'code'>('initial');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // MOCK SSO
      await new Promise(resolve => setTimeout(resolve, 1000));
      await signInWithGoogle('mock_id_token', 'google_user@gmail.com', 'Ronaldo', 'mock_google_id_123');
    } catch (e) {
      Alert.alert('Erro', 'Falha ao logar com Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestCode = async () => {
    if (!email.includes('@')) {
      Alert.alert('Erro', 'Digite um email válido');
      return;
    }
    setIsLoading(true);
    try {
      await requestEmailCode(email, name || undefined);
      setStep('code');
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Falha ao solicitar código');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length < 6) return;
    setIsLoading(true);
    try {
      await verifyEmailCode(email, code);
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Código inválido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-1 justify-center items-center px-6">
          <Image 
            source={require('../../assets/logo.png')} 
            className="w-64 h-32 mb-8" 
            resizeMode="contain" 
          />
          
          <Text className="text-2xl font-extrabold text-navy mb-2 text-center">
            Bem-vindo ao Economiza.Ai Alagoas
          </Text>
          <Text className="text-gray-500 text-center mb-8">
            Encontre os menores preços nos supermercados de Alagoas.
          </Text>

          {step === 'initial' && (
            <View className="w-full">
              <TouchableOpacity 
                className="bg-white border border-gray-200 rounded-xl py-4 flex-row justify-center items-center mb-4 shadow-sm"
                onPress={handleGoogleLogin}
                disabled={isLoading}
              >
                <Ionicons name="logo-google" size={24} color="#DB4437" className="mr-2" />
                <Text className="text-gray-700 font-bold ml-2">Continuar com Google</Text>
              </TouchableOpacity>

              <View className="flex-row items-center my-4">
                <View className="flex-1 h-px bg-gray-200" />
                <Text className="text-gray-400 mx-4 font-medium">OU</Text>
                <View className="flex-1 h-px bg-gray-200" />
              </View>

              <TouchableOpacity 
                className="bg-primary rounded-xl py-4 flex-row justify-center items-center shadow-sm"
                onPress={() => setStep('email')}
                disabled={isLoading}
              >
                <Ionicons name="mail-outline" size={24} color="white" className="mr-2" />
                <Text className="text-white font-bold ml-2">Entrar com E-mail</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 'email' && (
            <View className="w-full">
              <Text className="text-gray-700 font-bold mb-2">Qual seu e-mail?</Text>
              <TextInput
                className="bg-gray-100 rounded-xl px-4 py-4 mb-4 text-base text-gray-800"
                placeholder="seu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              
              <Text className="text-gray-700 font-bold mb-2">Como podemos te chamar?</Text>
              <TextInput
                className="bg-gray-100 rounded-xl px-4 py-4 mb-6 text-base text-gray-800"
                placeholder="Seu nome (opcional se já tiver conta)"
                value={name}
                onChangeText={setName}
              />

              <TouchableOpacity 
                className="bg-primary rounded-xl py-4 justify-center items-center shadow-sm flex-row"
                onPress={handleRequestCode}
                disabled={isLoading}
              >
                {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Receber Código</Text>}
              </TouchableOpacity>
              
              <TouchableOpacity className="mt-6 p-2" onPress={() => setStep('initial')}>
                <Text className="text-gray-500 text-center font-medium">Voltar</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 'code' && (
            <View className="w-full">
              <Text className="text-center text-gray-600 mb-6">
                Enviamos um código de 6 dígitos para o e-mail:
                <Text className="font-bold text-navy"> {email}</Text>
              </Text>
              
              <TextInput
                className="bg-gray-100 rounded-xl px-4 py-4 mb-6 text-center text-2xl font-bold tracking-[10px] text-primary"
                placeholder="000000"
                keyboardType="numeric"
                maxLength={6}
                value={code}
                onChangeText={setCode}
              />

              <TouchableOpacity 
                className="bg-primary rounded-xl py-4 justify-center items-center shadow-sm flex-row"
                onPress={handleVerifyCode}
                disabled={isLoading || code.length < 6}
              >
                {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Verificar e Entrar</Text>}
              </TouchableOpacity>

              <TouchableOpacity className="mt-6 p-2" onPress={() => setStep('email')}>
                <Text className="text-gray-500 text-center font-medium">Tentar outro e-mail</Text>
              </TouchableOpacity>
            </View>
          )}

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
