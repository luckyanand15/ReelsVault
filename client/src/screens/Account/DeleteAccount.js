import React, { useState } from 'react';
import { View, Text } from 'react-native';
import AuthLayout, { AuthHeading } from '../../components/AuthLayout/AuthLayout';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import routes from '../../routes/routes';
import { AccountFlow, useAccountFlow } from '../../context/AccountFlowContext';
import { OTP_RESEND_COOLDOWN_SECONDS } from '../../context/SignupFlowContext';
import { useTheme } from '../../context/ThemeContext';
import { sendDeleteAccountOtp } from '../../api/account.api';
import { formatRetryAfter } from '../../utils/formatRetryAfter';
import { ERROR_CODES } from '../../constants/errorCodes';
import styles from './DeleteAccount.styles';

// Step 1 of deleting the account: what will be lost. Agreeing emails a code
// to the account's address.
export default function DeleteAccount({ navigation, route }) {
  const email = route?.params?.email ?? '';
  const { startAccountFlow, markOtpSent } = useAccountFlow();
  const { colors } = useTheme();

  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleAgree = async () => {
    if (isSending) {
      return;
    }

    setIsSending(true);
    setError('');
    startAccountFlow({ flow: AccountFlow.Delete });

    try {
      await sendDeleteAccountOtp();
      markOtpSent();
      navigation.navigate(routes.AccountOtp, { email });
    } catch (err) {
      const { status, data } = err?.response || {};
      if (status === 429 && data?.code === ERROR_CODES.OTP_COOLDOWN) {
        // A code was sent moments ago and is still valid, so carry on.
        // Backdate otpSentAt so the resend timer shows the server's wait.
        const retryAfter = data.retryAfter ?? OTP_RESEND_COOLDOWN_SECONDS;
        markOtpSent({
          otpSentAt: Date.now() - (OTP_RESEND_COOLDOWN_SECONDS - retryAfter) * 1000,
        });
        navigation.navigate(routes.AccountOtp, { email, alreadySent: true });
      } else if (status === 429) {
        setError(`Too many requests. Please try again ${formatRetryAfter(data?.retryAfter)}.`);
      } else {
        setError('Failed to send the code. Please try again.');
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AuthLayout circleColor={colors?.pink} onBack={() => navigation?.goBack?.()}>
      <AuthHeading step="Step 1 of 4" title={'Delete your\naccount'}>
        Deleting your account will delete all your saved reels and categories. We'll email you a
        code to confirm it's you.
      </AuthHeading>

      <View style={styles?.actions}>
        <PrimaryButton
          title="I agree"
          onPress={handleAgree}
          loading={isSending}
          accessibilityLabel="I agree, send me a code"
        />
        <PrimaryButton
          title="Cancel"
          variant="secondary"
          onPress={() => navigation?.goBack?.()}
          accessibilityLabel="Cancel, keep my account"
        />
        {!!error && <Text style={[styles?.errorText, { color: colors?.pinkText }]}>{error}</Text>}
      </View>
    </AuthLayout>
  );
}
