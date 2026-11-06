import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import routes from '../../routes/routes';
import { useTheme } from '../../context/ThemeContext';
import ScreenBackground from '../../components/ScreenBackground/ScreenBackground';
import BrandMark from '../../components/BrandMark/BrandMark';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import WelcomeCollage from './WelcomeCollage';
import styles from './Welcome.styles';

export default function Welcome() {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const handleNavigateToSignup = () => {
    navigation?.navigate?.(routes?.Signup);
  };

  const handleNavigateToLogin = () => {
    navigation?.navigate?.(routes?.LoginEmail);
  };

  return (
    <View style={[styles?.root, { backgroundColor: colors?.bg }]}>
      <ScreenBackground />

      <SafeAreaView style={styles?.safeArea}>
        <View style={styles?.header}>
          <BrandMark />
        </View>

        <WelcomeCollage />

        {/* Copy + actions */}
        <View style={styles?.footer}>
          <View style={styles?.copy}>
            <Text
              style={[styles?.title, { color: colors?.fg }]}
              accessibilityRole="header"
            >
              {'Save it.\nSort it.\nFind it.'}
            </Text>
            <Text style={[styles?.subtitle, { color: colors?.mut }]}>
              Your space to organize, categorize and search the Reels and Shorts
              you save.
            </Text>
          </View>

          <View style={styles?.buttonContainer}>
            <PrimaryButton title="Sign up" onPress={handleNavigateToSignup} />
            <PrimaryButton
              title="Login"
              variant="secondary"
              onPress={handleNavigateToLogin}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
