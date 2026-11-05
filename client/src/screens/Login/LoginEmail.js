import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ScreenHeader/ScreenHeader';
import ScreenBackground from '../../components/ScreenBackground/ScreenBackground';
import TextField from '../../components/TextField/TextField';
import RoundArrowButton from '../../components/RoundArrowButton/RoundArrowButton';
import routes from '../../routes/routes';
import { useLoginFlow } from '../../context/LoginFlowContext';
import { useTheme } from '../../context/ThemeContext';
import styles from './LoginEmail.styles';

export default function LoginEmail({ navigation, route }) {
  const { confirmEmail } = useLoginFlow();
  const { colors } = useTheme();
  // Set after a password reset, which lands the user back here.
  const passwordReset = Boolean(route?.params?.passwordReset);

  const [email, setEmail] = useState(route?.params?.email ?? '');
  const [error, setError] = useState('');

  const validateEmail = (text) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text.trim());
  };

  const isEmailValid = validateEmail(email);

  const handleEmailChange = (text) => {
    setEmail(text);
    if (error && validateEmail(text)) {
      setError('');
    }
  };

  const handleArrowPress = () => {
    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    // No "is this email registered?" lookup here: that would let anyone
    // probe which emails have accounts. The password screen's login call
    // answers with a generic "Invalid email or password" either way.
    setError('');
    confirmEmail({ email: email.trim() });
    navigation.navigate(routes.LoginPassword);
  };

  return (
    <View style={[styles?.root, { backgroundColor: colors?.bg }]}>
      <ScreenBackground variant="auth" />

      <SafeAreaView style={styles?.safeArea}>
        <ScreenHeader onBack={() => navigation?.goBack?.()} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles?.keyboardAvoidingView}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles?.container}>
              <View style={styles?.form}>
                {/* Header Content */}
                <View style={styles?.headerContent}>
                  <Text
                    style={[styles?.title, { color: colors?.fg }]}
                    accessibilityRole="header"
                  >
                    {'Welcome\nback'}
                  </Text>
                  <Text style={[styles?.subtitle, { color: colors?.mut }]}>
                    Enter your email address to log in.
                  </Text>
                </View>

                {passwordReset && (
                  <View
                    style={[
                      styles?.successBanner,
                      { backgroundColor: colors?.surf, borderColor: colors?.accent },
                    ]}
                  >
                    <Text style={[styles?.successText, { color: colors?.fg }]}>
                      Your password has been changed and you've been logged out on all devices.
                      Log in with your new password.
                    </Text>
                  </View>
                )}

                <TextField
                  label="Email Address"
                  required
                  error={error}
                  value={email}
                  onChangeText={handleEmailChange}
                  placeholder="Enter your email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleArrowPress}
                />
              </View>

              {/* Footer with Arrow Button */}
              <View style={styles?.footer}>
                <RoundArrowButton
                  onPress={handleArrowPress}
                  active={isEmailValid}
                  accessibilityLabel="Continue"
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
