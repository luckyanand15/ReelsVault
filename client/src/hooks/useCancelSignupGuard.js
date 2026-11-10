import { useEffect, useRef, useState } from 'react';
import routes from '../routes/routes';
import { useSignupFlow } from '../context/SignupFlowContext';

// Back actions only. Resets (finishing signup, cancelling) and the screens'
// own replace() redirects go through untouched.
const BACK_ACTIONS = ['GO_BACK', 'POP', 'POP_TO_TOP'];

// For the Create Password screen (back would land on the used OTP): any back (header arrow, Android back,
// iOS swipe) opens the cancel drawer instead of leaving the screen.
// Render <CancelSignupSheet {...sheetProps} /> and pass onBack to the layout.
export default function useCancelSignupGuard(navigation) {
  const { resetSignup } = useSignupFlow();
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
        resetSignup();
      }
    },
    // resetSignup only calls state setters; the cleanup must run on unmount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const cancelSignup = () => {
    hasCancelledRef.current = true;
    setIsSheetVisible(false);
    navigation.reset({ index: 0, routes: [{ name: routes.Welcome }] });
  };

  return {
    onBack: () => setIsSheetVisible(true),
    sheetProps: {
      visible: isSheetVisible,
      onKeepGoing: () => setIsSheetVisible(false),
      onCancelSignup: cancelSignup,
    },
  };
}
