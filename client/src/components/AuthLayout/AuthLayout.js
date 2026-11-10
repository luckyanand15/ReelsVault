import React from 'react';
import {
  View,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import KeyboardAvoider from '../KeyboardAvoider/KeyboardAvoider';
import ScreenHeader from '../ScreenHeader/ScreenHeader';
import ScreenBackground from '../ScreenBackground/ScreenBackground';
import { useTheme } from '../../context/ThemeContext';
import styles from './AuthLayout.styles';

// The login-style step screen: dotted background with a coloured corner
// circle, back button + wordmark, the form, and a footer (the round arrow)
// pinned bottom-right that rises with the keyboard. Tapping outside a field
// closes the keyboard. formStyle overrides the form's spacing per screen.
export default function AuthLayout({
  circleColor,
  onBack,
  children,
  footer,
  formStyle,
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles?.root, { backgroundColor: colors?.bg }]}>
      <ScreenBackground variant="auth" circleColor={circleColor} />

      <SafeAreaView style={styles?.safeArea}>
        <ScreenHeader onBack={onBack} />

        <KeyboardAvoider style={styles?.keyboardAvoidingView}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles?.container}>
              <View style={[styles?.form, formStyle]}>{children}</View>
              {!!footer && <View style={styles?.footer}>{footer}</View>}
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoider>
      </SafeAreaView>
    </View>
  );
}

// Step label ("STEP 1 OF 3"), hero title and subtitle. The subtitle is
// children so it can hold nested Text (e.g. a highlighted email).
export function AuthHeading({ step, title, children }) {
  const { colors } = useTheme();

  return (
    <View style={styles?.heading}>
      {!!step && (
        <Text style={[styles?.step, { color: colors?.mut }]}>{step}</Text>
      )}
      <Text
        style={[styles?.title, { color: colors?.fg }]}
        accessibilityRole="header"
      >
        {title}
      </Text>
      {!!children && (
        <Text style={[styles?.subtitle, { color: colors?.mut }]}>{children}</Text>
      )}
    </View>
  );
}
