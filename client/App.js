import React from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { navigationRef } from './src/navigation/navigationRef';
import { AuthProvider } from './src/context/AuthContext';
import { CategoriesProvider } from './src/context/CategoriesContext';
import { SignupFlowProvider } from './src/context/SignupFlowContext';
import { LoginFlowProvider } from './src/context/LoginFlowContext';
import theme from './src/constants/theme';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <View style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} translucent={false} />
          <NavigationContainer ref={navigationRef}>
            <AuthProvider>
              <CategoriesProvider>
                <SignupFlowProvider>
                  <LoginFlowProvider>
                    <AppNavigator />
                  </LoginFlowProvider>
                </SignupFlowProvider>
              </CategoriesProvider>
            </AuthProvider>
          </NavigationContainer>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});



