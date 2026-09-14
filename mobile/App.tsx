import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { FeedScreen } from './src/screens/FeedScreen';
import { ResidentsScreen } from './src/screens/ResidentsScreen';
import { ResidentDetailScreen } from './src/screens/ResidentDetailScreen';
import { PostUpdateScreen } from './src/screens/PostUpdateScreen';
import { ScheduleVisitScreen } from './src/screens/ScheduleVisitScreen';
import type { RootStackParamList } from './src/navigation/types';
import { colors } from './src/theme/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  const { token } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '700', color: colors.text },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {!token ? (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen
            name="Feed"
            component={FeedScreen}
            options={{ title: 'Trinity Care', headerBackVisible: false }}
          />
          <Stack.Screen name="Residents" component={ResidentsScreen} options={{ title: 'Residents' }} />
          <Stack.Screen
            name="ResidentDetail"
            component={ResidentDetailScreen}
            options={{ title: 'Resident' }}
          />
          <Stack.Screen name="PostUpdate" component={PostUpdateScreen} options={{ title: 'Post update' }} />
          <Stack.Screen
            name="ScheduleVisit"
            component={ScheduleVisitScreen}
            options={{ title: 'Schedule visit' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
