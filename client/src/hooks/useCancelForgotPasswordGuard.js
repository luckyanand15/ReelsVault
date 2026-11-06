import { useEffect, useRef, useState } from 'react';
import routes from '../routes/routes';
import { useForgotPasswordFlow } from '../context/ForgotPasswordFlowContext';

// Back actions only. Resets (finishing the reset), popTo (cancelling, or an
// expired reset token) and the screens' own replace() redirects go through.
const BACK_ACTIONS = ['GO_BACK', 'POP', 'POP_TO_TOP'];

// For the Set a New Password screen (back would land on the used OTP): any
// back (header arrow, Android back, iOS swipe) opens the cancel drawer
// instead of leaving the screen. Same idea as useCancelSignupGuard.
// Render <CancelSignupSheet {...sheetProps} /> and pass onBack to the layout.
export default function useCancelForgotPasswordGuard(navigation) {
  const { resetForgotPasswordFlow } = useForgotPasswordFlow();
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const hasCancelledRef = useRef(false);

  useEffect(
    () =>
      navigation.addListener('beforeRemove', (e) => {
        if (!BACK_ACTIONS.includes(e?.data?.action?.type)) {
          return;
        }
        e.preventDefault();
        setIsSheetVisible(true);
      }),
    [navigation],
  );

  // Clearing the flow while these screens are still on the stack would trip
  // their "can't access this step" redirect, so wait until they're gone.
  useEffect(
    () => () => {
      if (hasCancelledRef.current) {
        resetForgotPasswordFlow();
      }
    },
    // resetForgotPasswordFlow only calls state setters; run on unmount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const cancelReset = () => {
    hasCancelledRef.current = true;
    setIsSheetVisible(false);
    // The flow is only reachable from the login password screen.
    navigation.popTo(routes.LoginPassword);
  };

  return {
    onBack: () => setIsSheetVisible(true),
    sheetProps: {
      visible: isSheetVisible,
      onKeepGoing: () => setIsSheetVisible(false),
      onCancelSignup: cancelReset,
      title: 'Cancel?',
      message: "This will cancel resetting your password. Your progress will be lost and you'll need to request a new code.",
      keepGoingAccessibilityLabel: 'No, continue resetting password',
      cancelAccessibilityLabel: 'Yes, cancel password reset',
    },
  };
}
