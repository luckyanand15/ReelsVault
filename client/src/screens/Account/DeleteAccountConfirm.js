import React, { useEffect } from 'react';
import { View } from 'react-native';
import AuthLayout, { AuthHeading } from '../../components/AuthLayout/AuthLayout';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import CancelSignupSheet from '../../components/CancelSignupSheet/CancelSignupSheet';
import useCancelAccountPasswordGuard from '../../hooks/useCancelAccountPasswordGuard';
import routes from '../../routes/routes';
import { AccountFlow, useAccountFlow } from '../../context/AccountFlowContext';
import { useTheme } from '../../context/ThemeContext';
import styles from './DeleteAccount.styles';

export const DELETE_CANCEL_COPY = {
  message:
    "This will cancel deleting your account. Your account stays as it is, and you'll need to start again to delete it.",
  keepGoingAccessibilityLabel: 'No, continue deleting account',
  cancelAccessibilityLabel: 'Yes, cancel account deletion',
};

// Step 3 of deleting the account, once the emailed code is confirmed: the
// last chance to back out before the password.
export default function DeleteAccountConfirm({ navigation }) {
  const { accountData } = useAccountFlow();
  const { colors } = useTheme();
  // Back would land on the used code, so it asks to cancel instead.
  const cancelGuard = useCancelAccountPasswordGuard(navigation, DELETE_CANCEL_COPY);
  const canAccessStep = accountData.flow === AccountFlow.Delete && Boolean(accountData.deleteToken);

  useEffect(() => {
    // Only while on top, so a later step leaving the flow doesn't redirect.
    if (!canAccessStep && navigation.isFocused()) {
      navigation.popTo(routes.Settings);
    }
  }, [canAccessStep, navigation]);

  if (!canAccessStep) {
    return null;
  }

  return (
    <AuthLayout circleColor={colors?.pink} onBack={cancelGuard.onBack}>
      <AuthHeading step="Step 3 of 4" title={'Are you\nsure?'}>
        Are you sure you want to delete your account? You will lose all your reels and categories,
        and this action can't be undone.
      </AuthHeading>

      <View style={styles?.actions}>
        <PrimaryButton
          title="Proceed"
          onPress={() => navigation.navigate(routes.DeleteAccountPassword)}
          accessibilityLabel="Proceed to delete my account"
        />
        <PrimaryButton
          title="Cancel"
          variant="secondary"
          onPress={cancelGuard.cancel}
          accessibilityLabel="Cancel, keep my account"
        />
      </View>

      <CancelSignupSheet {...cancelGuard.sheetProps} />
    </AuthLayout>
  );
}
