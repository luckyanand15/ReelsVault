import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Welcome from '../screens/Welcome/Welcome';
import Signup from '../screens/Signup/Signup';
import SignupEmail from '../screens/Signup/SignupEmail';
import SignupOtp from '../screens/Signup/SignupOtp';
import SignupPin from '../screens/Signup/SignupPin';
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
      <Stack.Screen name={routes.Signup} component={Signup} />
      <Stack.Screen name={routes.SignupEmail} component={SignupEmail} />
      <Stack.Screen name={routes.SignupOtp} component={SignupOtp} />
      <Stack.Screen name={routes.SignupPin} component={SignupPin} />
      <Stack.Screen name={routes.Dashboard} component={Dashboard} />
      <Stack.Screen name={routes.Settings} component={Settings} />
      <Stack.Screen name={routes.ManageCategories} component={ManageCategories} />
    </Stack.Navigator>
  );
}
