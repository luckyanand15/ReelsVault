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
import { ForgotPasswordFlowProvider } from './src/context/ForgotPasswordFlowContext';
import { AccountFlowProvider } from './src/context/AccountFlowContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

// Every screen uses the theme, so the status bar and the backdrop shown during
// screen transitions follow it here instead of per screen.
function ThemedApp() {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bg}
        translucent={false}
      />
      <NavigationContainer ref={navigationRef}>
        <AuthProvider>
          <CategoriesProvider>
            <SignupFlowProvider>
              <LoginFlowProvider>
                <ForgotPasswordFlowProvider>
                  <AccountFlowProvider>
                    <AppNavigator />
                  </AccountFlowProvider>
                </ForgotPasswordFlowProvider>
              </LoginFlowProvider>
            </SignupFlowProvider>
          </CategoriesProvider>
        </AuthProvider>
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ThemedApp />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
