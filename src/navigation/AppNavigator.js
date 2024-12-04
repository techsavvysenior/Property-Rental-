import React, { useContext, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-elements';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ApartmentListScreen from '../screens/ApartmentListScreen';
import AddApartmentScreen from '../screens/AddApartmentScreen';
import ApartmentDetailScreen from '../screens/ApartmentDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import auth from '@react-native-firebase/auth';
import { ActivityIndicator, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import SplashScreen from '../screens/SplashScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { Colors } from '../assets/Colors';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

import { TouchableOpacity, Text } from 'react-native';

const CustomTabBarButton = ({ children, onPress }) => (
  <TouchableOpacity
    style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
    onPress={onPress}
  >
    {children}
  </TouchableOpacity>
);

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'black',
          height: 60,
          alignItems: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 20,
          fontWeight: 'bold',
          textAlign: 'center',
          flex: 1,
        },
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'grey',
        tabBarIcon: () => null,
      }}
    >
      <Tab.Screen
        name="Home"
        component={ApartmentListScreen}
        options={{
          tabBarButton: (props) => (
            <CustomTabBarButton {...props}>
              <Text style={{ color: props.accessibilityState.selected ? 'white' : 'grey', fontWeight: 'bold' }}>
                Apartments
              </Text>
            </CustomTabBarButton>
          ),
        }}
      />
      <Tab.Screen
        name="AddApartment"
        component={AddApartmentScreen}
        options={{
          headerShown: false,
          tabBarButton: () => null,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarButton: (props) => (
            <CustomTabBarButton {...props}>
              <Text style={{ color: props.accessibilityState.selected ? 'white' : 'grey', fontWeight: 'bold' }}>
                Settings
              </Text>
            </CustomTabBarButton>
          ),
        }}
      />
      <Tab.Screen
        name="ApartmentDetailScreen"
        component={ApartmentDetailScreen}
        options={{
          headerShown: false,
          tabBarButton: () => null,
        }}
      />
      
    </Tab.Navigator>
  );
};
const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Login');
  const { user, role } = useContext(AuthContext);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        setInitialRoute('Tabs');
      } else {
        setInitialRoute('Login');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const splashTimeout = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(splashTimeout);
  }, []);

  if (showSplash) {
    return <SplashScreen userRole={role} />;
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.blue} />
      </View>
    );
  }

  return (
    <NavigationContainer independent>
      <Stack.Navigator initialRouteName={initialRoute} options={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen
          name="Tabs"
          component={() => <TabNavigator userRole={role} />}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="AddApartment" component={AddApartmentScreen} options={{
          headerShown: false,
        }} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
