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
import styles from './SignupOtp.styles';

export default function SignupOtp({ navigation }) {
  const { canAccessStep, confirmEmailVerification, signupData } = useSignupFlow();
  const { email } = signupData;
  const canAccessOtpStep = canAccessStep(SignupStep.Otp) && Boolean(email);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [error, setError] = useState('');

  const inputRefs = useRef([]);

  useEffect(() => {
    if (!canAccessOtpStep) {
      navigation.replace(routes.Signup);
    }
  }, [canAccessOtpStep, navigation]);

  const fullOtp = otp.join('');
  const isOtpComplete = fullOtp.length === 6;

  const handleChangeText = (text, index) => {
    const cleanedText = text.replace(/[^0-9]/g, '');

    const newOtp = [...otp];

    if (cleanedText.length > 1) {
      // Handle pasting a 6-digit code
      const digits = cleanedText.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newOtp[i] = digits[i] || '';
      }
      setOtp(newOtp);
      const nextFocus = Math.min(digits.length, 5);
      inputRefs.current[nextFocus]?.focus();
    } else {
      newOtp[index] = cleanedText;
      setOtp(newOtp);

      if (cleanedText && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }

    if (error) {
      setError('');
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleArrowPress = () => {
    if (!isOtpComplete) {
      setError('Please enter all 6 digits.');
      return;
    }

    // Temporary verification check as requested (accept 111111)
    if (fullOtp !== '111111') {
      setError('Invalid OTP code. Enter 111111 to proceed.');
      return;
    }

    setError('');
    confirmEmailVerification();
    navigation.navigate(routes.SignupPin);
  };

  if (!canAccessOtpStep) {
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
              <Text style={styles?.stepIndicator}>Step 3 of 3</Text>
              <Text style={styles?.title}>Enter verification code</Text>
              <Text style={styles?.subtitle}>
                We sent a 6-digit code to{' '}
                <Text style={styles?.emailHighlight}>
                  {email || 'your email'}
                </Text>
              </Text>
            </View>

            {/* OTP Input Form */}
            <View style={styles?.form}>
              <View style={styles?.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    style={[
                      styles?.otpBox,
                      focusedIndex === index && styles?.otpBoxFocused,
                      !!error && styles?.otpBoxError,
                    ]}
                    value={digit}
                    onChangeText={(text) => handleChangeText(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    onFocus={() => setFocusedIndex(index)}
                    onBlur={() => setFocusedIndex(null)}
                    keyboardType="number-pad"
                    maxLength={6}
                    selectTextOnFocus
                  />
                ))}
              </View>

              {error ? (
                <Text style={styles?.errorText}>{error}</Text>
              ) : (
                <Text style={styles?.hintText}>
                  Use code <Text style={styles?.emailHighlight}>111111</Text> to verify
                </Text>
              )}
            </View>

            {/* Footer with Arrow Button */}
            <View style={styles?.footer}>
              <TouchableOpacity
                style={[
                  styles?.arrowButton,
                  !isOtpComplete && styles?.arrowButtonDisabled,
                ]}
                onPress={handleArrowPress}
                disabled={!isOtpComplete}
                activeOpacity={0.8}
                accessibilityLabel="Verify OTP"
                accessibilityState={{ disabled: !isOtpComplete }}
              >
                <Text
                  style={[
                    styles?.arrowIcon,
                    !isOtpComplete && styles?.arrowIconDisabled,
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
