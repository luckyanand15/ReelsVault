import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header/Header';
import routes from '../../routes/routes';
import { SignupStep, useSignupFlow } from '../../context/SignupFlowContext';
import styles from './SignupPin.styles';

export default function SignupPin({ navigation }) {
  const { canAccessStep, signupData } = useSignupFlow();
  const { email, isEmailVerified } = signupData;
  const canAccessPinStep =
    canAccessStep(SignupStep.Pin) && Boolean(email) && isEmailVerified;

  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [error, setError] = useState('');

  const inputRefs = useRef([]);

  useEffect(() => {
    if (!canAccessPinStep) {
      navigation.replace(routes.Signup);
    }
  }, [canAccessPinStep, navigation]);

  const fullPin = pin.join('');
  const isPinComplete = fullPin.length === 6;

  const handleChangeText = (text, index) => {
    const cleanedText = text.replace(/[^0-9]/g, '');
    const newPin = [...pin];

    if (cleanedText.length > 1) {
      // Handle pasting a 6-digit PIN
      const digits = cleanedText.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newPin[i] = digits[i] || '';
      }
      setPin(newPin);
      const nextFocus = Math.min(digits.length, 5);
      inputRefs.current[nextFocus]?.focus();
    } else {
      newPin[index] = cleanedText;
      setPin(newPin);

      if (cleanedText && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }

    if (error) {
      setError('');
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !pin[index] && index > 0) {
      const newPin = [...pin];
      newPin[index - 1] = '';
      setPin(newPin);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleArrowPress = () => {
    if (!isPinComplete) {
      setError('Please enter all 6 digits for your PIN.');
      return;
    }

    setError('');
    // Reset navigation stack and open Dashboard
    navigation?.reset?.({
      index: 0,
      routes: [{ name: routes?.Dashboard }],
    });
  };

  if (!canAccessPinStep) {
    return null;
  }

  return (
    <SafeAreaView style={styles?.safeArea} edges={['top', 'left', 'right']}>
      <Header onLeftPress={() => navigation?.goBack?.()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles?.keyboardAvoidingView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles?.container}>
            {/* Header Content */}
            <View style={styles?.headerContent}>
              <Text style={styles?.stepIndicator}>Security Setup</Text>
              <Text style={styles?.title}>Create a 6-digit PIN</Text>
              <Text style={styles?.subtitle}>
                This PIN will be required every time you open or log into Reels Vault.
              </Text>
            </View>

            {/* PIN Input Form */}
            <View style={styles?.form}>
              <View style={styles?.pinContainer}>
                {pin.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    style={[
                      styles?.pinBox,
                      focusedIndex === index && styles?.pinBoxFocused,
                      error ? styles?.pinBoxError : null,
                    ]}
                    value={digit}
                    onChangeText={(text) => handleChangeText(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    onFocus={() => setFocusedIndex(index)}
                    onBlur={() => setFocusedIndex(null)}
                    keyboardType="number-pad"
                    maxLength={6}
                    secureTextEntry
                    selectTextOnFocus
                  />
                ))}
              </View>

              {error ? (
                <Text style={styles?.errorText}>{error}</Text>
              ) : (
                <Text style={styles?.hintText}>
                  Keep your PIN safe and easy for you to remember.
                </Text>
              )}
            </View>

            {/* Footer with Arrow Button */}
            <View style={styles?.footer}>
              <TouchableOpacity
                style={[
                  styles?.arrowButton,
                  !isPinComplete && styles?.arrowButtonDisabled,
                ]}
                onPress={handleArrowPress}
                disabled={!isPinComplete}
                activeOpacity={0.8}
                accessibilityLabel="Complete registration and go to Dashboard"
                accessibilityState={{ disabled: !isPinComplete }}
              >
                <Text
                  style={[
                    styles?.arrowIcon,
                    !isPinComplete && styles?.arrowIconDisabled,
                  ]}
                >
                  ➔
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
