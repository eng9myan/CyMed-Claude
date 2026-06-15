import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Activity, User, Video } from 'lucide-react-native';

import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import TelehealthScreen from '../screens/TelehealthScreen';
import ChatbotScreen from '../screens/ChatbotScreen';

import LabResultsScreen from '../screens/LabResultsScreen';
import MedicationsScreen from '../screens/MedicationsScreen';
import AppointmentsScreen from '../screens/AppointmentsScreen';
import BookAppointmentScreen from '../screens/BookAppointmentScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Dashboard') {
            return <Activity color={color} size={size} />;
          } else if (route.name === 'Telehealth') {
            return <Video color={color} size={size} />;
          } else if (route.name === 'Copilot') {
            return <User color={color} size={size} />;
          }
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Telehealth" component={TelehealthScreen} />
      <Tab.Screen name="Copilot" component={ChatbotScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="LabResults" component={LabResultsScreen} options={{ headerShown: true, title: 'Lab Results' }} />
        <Stack.Screen name="Medications" component={MedicationsScreen} options={{ headerShown: true, title: 'My Medications' }} />
        <Stack.Screen name="Appointments" component={AppointmentsScreen} options={{ headerShown: true, title: 'My Appointments' }} />
        <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} options={{ headerShown: true, title: 'Book Appointment' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
