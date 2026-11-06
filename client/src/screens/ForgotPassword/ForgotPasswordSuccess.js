import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import AuthLayout, { AuthHeading } from '../../components/AuthLayout/AuthLayout';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import { useTheme } from '../../context/ThemeContext';
import routes from '../../routes/routes';
import styles from './ForgotPasswordSuccess.styles';

const COUNTDOWN_SECONDS = 5;

// Shown once the password has been reset. Counts down, then opens the login
// flow (email first) with the account's email filled in.
export default function ForgotPasswordSuccess({ navigation, route }) {
  const { colors } = useTheme();
  const email = route?.params?.email ?? '';

  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const intervalRef = useRef(null);
  const hasLeftRef = useRef(false);

  const stopCountdown = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const goToLogin = useCallback(() => {
    if (hasLeftRef.current) {
      return;
    }
    hasLeftRef.current = true;
    stopCountdown();
    navigation.reset({
      index: 1,
      routes: [
        { name: routes.Welcome },
        { name: routes.LoginEmail, params: { email } },
      ],
    });
  }, [email, navigation, stopCountdown]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return stopCountdown;
  }, [stopCountdown]);

  useEffect(() => {
    if (secondsLeft === 0) {
      goToLogin();
    }
  }, [secondsLeft, goToLogin]);

  // Leaving another way (back button, Android back) must not let the timer
  // fire the login redirect while this screen animates out.
  useEffect(
    () =>
      navigation.addListener('beforeRemove', () => {
        hasLeftRef.current = true;
        stopCountdown();
      }),
    [navigation, stopCountdown],
  );

  return (
    <AuthLayout circleColor={colors?.cyan} onBack={() => navigation?.goBack?.()}>
      <AuthHeading title={'Password\nchanged'}>
        Your password has been changed and you've been logged out on all devices.
        Log in with your new password.
      </AuthHeading>

      <View style={styles?.actions}>
        <PrimaryButton title="Log in" onPress={goToLogin} />
        <Text
          style={[styles?.countdownText, { color: colors?.mut }]}
          accessibilityLiveRegion="polite"
        >
          Taking you to log in in{' '}
          <Text style={[styles?.countdownNumber, { color: colors?.fg }]}>
            {secondsLeft}
          </Text>
          {secondsLeft === 1 ? ' second' : ' seconds'}
        </Text>
      </View>
    </AuthLayout>
  );
}
