import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import AuthLayout, { AuthHeading } from '../../components/AuthLayout/AuthLayout';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { useAccountFlow } from '../../context/AccountFlowContext';
import { useTheme } from '../../context/ThemeContext';
import routes from '../../routes/routes';
import styles from './DeleteAccount.styles';

const COUNTDOWN_SECONDS = 5;

// Shown once the account has been deleted, with Welcome under it in the
// stack. Counts down, then goes to Welcome.
export default function DeleteAccountSuccess({ navigation }) {
  const { endLocalSession } = useAuth();
  const { resetAccountFlow } = useAccountFlow();
  const { colors } = useTheme();

  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const intervalRef = useRef(null);
  const hasLeftRef = useRef(false);

  // Here rather than on the password screen: by now the flow's screens are
  // off the stack, so clearing their state can't trigger their redirects.
  // The server already revoked every session, so this only forgets it.
  useEffect(() => {
    resetAccountFlow();
    endLocalSession().catch((error) => console.error('Failed to clear session:', error?.message));
    // Both only touch state; run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopCountdown = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const goToWelcome = useCallback(() => {
    if (hasLeftRef.current) {
      return;
    }
    hasLeftRef.current = true;
    stopCountdown();
    navigation.reset({ index: 0, routes: [{ name: routes.Welcome }] });
  }, [navigation, stopCountdown]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return stopCountdown;
  }, [stopCountdown]);

  useEffect(() => {
    if (secondsLeft === 0) {
      goToWelcome();
    }
  }, [secondsLeft, goToWelcome]);

  // Leaving another way (back button, Android back) lands on Welcome too;
  // the timer mustn't fire a second redirect while this animates out.
  useEffect(
    () =>
      navigation.addListener('beforeRemove', () => {
        hasLeftRef.current = true;
        stopCountdown();
      }),
    [navigation, stopCountdown],
  );

  return (
    <AuthLayout circleColor={colors?.pink} onBack={() => navigation?.goBack?.()}>
      <AuthHeading title={'Account\ndeleted'}>
        Your account and all your saved reels and categories have been deleted.
      </AuthHeading>

      <View style={styles?.actions}>
        <PrimaryButton title="Continue" onPress={goToWelcome} />
        <Text
          style={[styles?.countdownText, { color: colors?.mut }]}
          accessibilityLiveRegion="polite"
        >
          Taking you to the welcome screen in{' '}
          <Text style={[styles?.countdownNumber, { color: colors?.fg }]}>{secondsLeft}</Text>
          {secondsLeft === 1 ? ' second' : ' seconds'}
        </Text>
      </View>
    </AuthLayout>
  );
}
