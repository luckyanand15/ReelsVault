import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Welcome from '../screens/Welcome/Welcome';
import Dashboard from '../screens/Dashboard/Dashboard';
import Settings from '../screens/Settings/Settings';
import ManageCategories from '../components/ManageCategories/ManageCategories';
import routes from '../routes/routes';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={routes.Welcome}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name={routes.Welcome} component={Welcome} />
      <Stack.Screen name={routes.Dashboard} component={Dashboard} />
      <Stack.Screen name={routes.Settings} component={Settings} />
      <Stack.Screen name={routes.ManageCategories} component={ManageCategories} />
    </Stack.Navigator>
  );
}
