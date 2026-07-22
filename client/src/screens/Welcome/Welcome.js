import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import routes from '../../routes/routes';
import styles from './Welcome.styles';

export default function Welcome() {
  const navigation = useNavigation();

  const handleNavigateToDashboard = () => {
    navigation?.navigate?.(routes?.Dashboard);
  };

  return (
    <SafeAreaView style={styles?.safeArea}>
      <View style={styles?.container}>
        {/* Core Content: Logo and Title */}
        <View style={styles?.content}>
          <View style={styles?.logoContainer}>
            <Text style={styles?.logoEmoji}>🎬</Text>
          </View>
          <Text style={styles?.title}>Welcome to Reels Vault</Text>
          <Text style={styles?.subtitle}>
            Your premium, offline-first space to organize, categorize, and safeguard your favorite video reels.
          </Text>
        </View>

        {/* Auth Buttons */}
        <View style={styles?.buttonContainer}>
          <TouchableOpacity
            style={[styles?.button, styles?.signUpButton]}
            onPress={handleNavigateToDashboard}
            activeOpacity={0.8}
          >
            <Text style={styles?.signUpButtonText}>Sign up</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles?.button, styles?.loginButton]}
            onPress={handleNavigateToDashboard}
            activeOpacity={0.7}
          >
            <Text style={styles?.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
