import React, { useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import AuthLayout, { AuthHeading } from '../../components/AuthLayout/AuthLayout';
import TextField from '../../components/TextField/TextField';
import RoundArrowButton from '../../components/RoundArrowButton/RoundArrowButton';
import CancelSignupSheet from '../../components/CancelSignupSheet/CancelSignupSheet';
import useCancelAccountPasswordGuard from '../../hooks/useCancelAccountPasswordGuard';
import routes from '../../routes/routes';
import { AccountFlow, useAccountFlow } from '../../context/AccountFlowContext';
import { useTheme } from '../../context/ThemeContext';
import { deleteAccount } from '../../api/account.api';
import { formatRetryAfter } from '../../utils/formatRetryAfter';
import { ERROR_CODES } from '../../constants/errorCodes';
import { exitToSettings } from './accountFlowErrors';
import { DELETE_CANCEL_COPY } from './DeleteAccountConfirm';
import styles from './AccountPassword.styles';

// Step 4 of deleting the account: the current password, which deletes it.
export default function DeleteAccountPassword({ navigation }) {
  const { accountData, resetAccountFlow } = useAccountFlow();
  const { colors } = useTheme();
  const cancelGuard = useCancelAccountPasswordGuard(navigation, DELETE_CANCEL_COPY);
  const { flow, deleteToken } = accountData;
  const canAccessStep = flow === AccountFlow.Delete && Boolean(deleteToken);

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set before this screen clears the flow on its way out, so the guard
  // below doesn't also try to redirect.
  const isLeavingRef = useRef(false);

  useEffect(() => {
    if (!canAccessStep && !isLeavingRef.current) {
      navigation.popTo(routes.Settings);
    }
  }, [canAccessStep, navigation]);

  const isFormValid = password.length > 0;

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (error) {
      setError('');
    }
  };

  const handleArrowPress = async () => {
    if (!isFormValid) {
      setError('Password is required.');
      return;
    }
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await deleteAccount({ deleteToken, password });
      isLeavingRef.current = true;
      // Welcome sits under the success screen, so back from it lands there
      // too. The success screen clears the session and the flow once this
      // stack is gone.
      navigation.reset({
        index: 1,
        routes: [{ name: routes.Welcome }, { name: routes.DeleteAccountSuccess }],
      });
    } catch (err) {
      const { status, data } = err?.response || {};
      if (data?.code === ERROR_CODES.DELETE_TOKEN_INVALID) {
        isLeavingRef.current = true;
        exitToSettings(navigation, resetAccountFlow, data.message);
      } else if (status === 429 && data?.code !== ERROR_CODES.LOGIN_LOCKED) {
        setError(`Too many requests. Please try again ${formatRetryAfter(data?.retryAfter)}.`);
      } else {
        setError(data?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canAccessStep && !isLeavingRef.current) {
    return null;
  }

  const showHideToggle = (
    <TouchableOpacity
      style={styles?.toggleButton}
      onPress={() => setShowPassword((prev) => !prev)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
    >
      <Text style={[styles?.toggleText, { color: colors?.fg }]}>
        {showPassword ? 'Hide' : 'Show'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <AuthLayout
      circleColor={colors?.pink}
      onBack={cancelGuard.onBack}
      footer={
        <RoundArrowButton
          onPress={handleArrowPress}
          active={isFormValid}
          loading={isSubmitting}
          accessibilityLabel="Delete account"
        />
      }
    >
      <AuthHeading step="Step 4 of 4" title={'Enter your\npassword'}>
        Confirm your current password to permanently delete your account.
      </AuthHeading>

      <TextField
        label="Current Password"
        required
        error={error}
        floatingError
        labelAccessory={showHideToggle}
        value={password}
        onChangeText={handlePasswordChange}
        placeholder="Enter your current password"
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="password"
        returnKeyType="done"
        onSubmitEditing={handleArrowPress}
        autoFocus
      />

      <CancelSignupSheet {...cancelGuard.sheetProps} />
    </AuthLayout>
  );
}
