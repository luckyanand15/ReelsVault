import { useEffect, useRef, useState } from 'react';
import routes from '../routes/routes';
import { useAccountFlow } from '../context/AccountFlowContext';

// Back actions only. popTo (cancelling, finishing, or an expired token) and
// the screens' own redirects go through.
const BACK_ACTIONS = ['GO_BACK', 'POP', 'POP_TO_TOP'];

// For the account Set a New Password screen (back would land on the used
// OTP): any back (header arrow, Android back, iOS swipe) opens the cancel
// drawer instead of leaving the screen. Same idea as useCancelSignupGuard.
// Render <CancelSignupSheet {...sheetProps} /> and pass onBack to the layout.
export default function useCancelAccountPasswordGuard(navigation) {
  const { resetAccountFlow } = useAccountFlow();
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
        resetAccountFlow();
      }
    },
    // resetAccountFlow only calls a state setter; run on unmount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const cancelChange = () => {
    hasCancelledRef.current = true;
    setIsSheetVisible(false);
    navigation.popTo(routes.Settings);
  };

  return {
    onBack: () => setIsSheetVisible(true),
    sheetProps: {
      visible: isSheetVisible,
      onKeepGoing: () => setIsSheetVisible(false),
      onCancelSignup: cancelChange,
      title: 'Cancel?',
      message: "This will cancel changing your password. Your progress will be lost and you'll need to start again.",
      keepGoingAccessibilityLabel: 'No, continue changing password',
      cancelAccessibilityLabel: 'Yes, cancel password change',
    },
  };
}
