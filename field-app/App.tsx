import 'react-native-get-random-values';
import React, { useEffect } from 'react';
import { AppNavigator } from './src/navigation/AppNavigator';
import { syncManager } from './src/services/syncManager';
import { wsClient } from './src/services/wsClient';
import { useAuthStore } from './src/store/authStore';

export default function App() {
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    syncManager.init();
  }, []);

  useEffect(() => {
    if (token) {
      wsClient.connect();
    } else {
      wsClient.disconnect();
    }
    return () => wsClient.disconnect();
  }, [token]);

  return (
    <AppNavigator />
  );
}
