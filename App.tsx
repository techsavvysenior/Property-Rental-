import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from './src/hooks/useAuth';
import firebase from '@react-native-firebase/app'; 
import Toast from 'react-native-root-toast'; 
import { Colors } from './src/assets/Colors';

const App: React.FC = () => {
  useEffect(() => {
    if (firebase.apps.length) {
      console.log("Firebase Initialized", firebase.apps);
    } else {
      console.log("Firebase not initialized");
    }
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
};

const RootNavigator: React.FC = () => {
  const { user, loading ,role} = useAuth();
  console.log("RootNavigatorROle",role)
  useEffect(() => {
    if (user) {
      Toast.show(`Login Successful! Welcome ${user.email}`, {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
    }
  }, [user]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.blue} />
      </View>
    );
  }

  return <AppNavigator />;
};

export default App;
